class Composer {
  constructor() {
    this.middlewares = []
    this.ctx = {}
  }

  use(fn) {
    this.middlewares.push(fn)
  }

  compose() {
    const dispatch = idx => {
      if (this.middlewares.length === idx) {
        return Promise.resolve()
      }
      let middleware = this.middlewares[idx]
      // 这里的next函数作为参数，必须返回dispatch(idx + 1)，以供await next()执行，否则next()返回undefined，next里的异步操作也不会被await
      return Promise.resolve(middleware(this.ctx, () => dispatch(idx + 1)))
    }
    dispatch(0)
  }
}

let app = new Composer()

app.use(async (ctx, next) => {
  ctx.text = 'first'
  await next()
  console.log(ctx.text)
})

app.use(async (ctx, next) => {
  await new Promise(resolve => {
    setTimeout(() => {
      ctx.sec = 'sec'
      console.log(ctx.sec)
      resolve()
    }, 2000)
  }).then(async () => {
    await next()
  })
})

app.use(ctx => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('la')
      console.log(ctx)
      resolve()
    }, 2000)
  })
})

app.compose()
