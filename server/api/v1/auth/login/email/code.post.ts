interface RequestBody {
  email: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)

  if (!body.email || !body.email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Invalid email format' } },
    })
  }

  setResponseStatus(event, 204)
  return null
})
