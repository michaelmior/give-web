import { getByRole, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Recaptcha } from './Recaptcha'
import React from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

jest.mock('react-google-recaptcha-v3');

(useGoogleReCaptcha as jest.Mock).mockImplementation(() => {
  return {
    executeRecaptcha: mockExecuteRecaptcha
  }
})

let mockExecuteRecaptcha = jest.fn()

describe('Recaptcha component', () => {
  const $translate = {
    instant: jest.fn()
  };

  const $log = {
    warn: jest.fn(),
    error: jest.fn()
  }

  beforeEach(() => {
    $translate.instant.mockImplementation((input) => input)
    mockExecuteRecaptcha = jest.fn()
    mockExecuteRecaptcha.mockImplementation(() => Promise.resolve('token'))
  })

  it('should render', () => {
    const onSuccess = jest.fn(() => console.log('success'))
    const { getAllByRole } = render(
      buildRecaptcha(onSuccess)
    )
    expect(getAllByRole('button')).toHaveLength(1)
    const recaptchaEnabledButton = getAllByRole('button')[0]
    expect(recaptchaEnabledButton.id).toEqual('id')
    expect(recaptchaEnabledButton.className).toEqual('btn')
    expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(false)
    expect(recaptchaEnabledButton.innerHTML).toEqual('Label')
  })

  it('should successfully pass the recaptcha', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.9, action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('success'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledTimes(1)
    )
  })

  it('should log a warning due to low score', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.2, action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('warning'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect($log.warn).toHaveBeenCalledWith('Captcha score was below the threshold: 0.2')
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('should fail the recaptcha call', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'some error', action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  it('should skip the success function when not submit', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, action: 'read' })
      })
    })

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  it('should skip the recaptcha call', async () => {
    //@ts-ignore
    mockExecuteRecaptcha = undefined

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  it('should not block the gift if something went wrong with recaptcha', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.reject('Failed')
    })

    const onSuccess = jest.fn(() => console.log('success after error'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect($log.error).toHaveBeenCalledWith('Failed to verify recaptcha, continuing on: Failed')
    })
  })

  it('should not block the gift if something went wrong with recaptcha JSON', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.reject('Failed')
      })
    })

    const onSuccess = jest.fn(() => console.log('success after JSON error'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect($log.error).toHaveBeenCalledWith('Failed to return recaptcha JSON, continuing on: Failed')
    })
  })

  it('should not block gifts if something weird happens', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve()
      })
    })

    const onSuccess = jest.fn(() => console.log('success after weird'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect($log.warn).toHaveBeenCalledWith('Data was falsy!')
    })
  })

  const buildRecaptcha = (onSuccess: (componentInstance: any) => void) => {
    return <Recaptcha
      action='submit'
      onSuccess={onSuccess}
      componentInstance={{}}
      buttonId='id'
      buttonType='submit'
      buttonClasses='btn'
      buttonDisabled={false}
      buttonLabel='Label'
      $translate={$translate}
      $log={$log}
    />
  }
})