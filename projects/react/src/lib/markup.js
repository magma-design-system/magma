export const id = (id, value, length) => {
    if (value) {
        //if (id) {
        if (id === '') {
            const maxLength = length || 1000
            const fullId = value.toString().replace(/(\W{1,})/gm, '-').replace(/(-)$/gm, '').toLowerCase()
            const shortId = fullId.split('-').slice(0, fullId.length >= maxLength ? maxLength : fullId.length)
            return shortId.join('-')
        }
        return id.toString().replace(/(\W{1,})/gm, '-').replace(/(-)$/gm, '').toLowerCase()
            //}
    }
    return undefined
}