import { isValidProvider } from '../../../../utils/mockAuth'

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')

  if (!provider || !isValidProvider(provider)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: `Unknown provider: ${provider}` } },
    })
  }

  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const redirectUrl = `${protocol}://${host}/mock-oauth/${provider}`

  return {
    redirect_url: redirectUrl,
  }
})
