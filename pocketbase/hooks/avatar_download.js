routerAdd(
  'GET',
  '/backend/v1/avatar-download',
  (e) => {
    const url = e.requestInfo().query['url']
    if (!url) return e.badRequestError('missing url parameter')

    const allowed = [
      'https://api.dicebear.com/',
      'https://images.unsplash.com/',
      'https://images.pexels.com/',
      'https://img.usecurling.com/',
    ]

    var valid = false
    for (var i = 0; i < allowed.length; i++) {
      if (url.indexOf(allowed[i]) === 0) {
        valid = true
        break
      }
    }
    if (!valid) return e.badRequestError('invalid image source')

    var res
    try {
      res = $http.send({ url: url, method: 'GET', timeout: 15 })
    } catch (err) {
      $app.logger().error('avatar download fetch failed', 'url', url, 'error', err.message || '')
      return e.json(502, { error: 'failed to fetch image' })
    }

    if (res.statusCode !== 200) {
      return e.json(res.statusCode, { error: 'image source returned error' })
    }

    var ct = res.headers['Content-Type'] || res.headers['content-type'] || 'image/png'
    if (ct.indexOf(';') !== -1) {
      ct = ct.split(';')[0].trim()
    }

    return e.blob(200, ct, res.body)
  },
  $apis.requireAuth(),
)
