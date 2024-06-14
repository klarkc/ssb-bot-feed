export default (sbot) => (data, cb) => {
    if (typeof data.content === 'string') {
        sbot.unbox(data.content, (err, unboxed) => {
            cb(
                err,
                {
                    ...data,
                    content: unboxed
                }
            )
        })
    } else {
        cb(null, data)
    }
}