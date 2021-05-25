class ApiFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const filteredQueryStr = {}
        Object.keys(this.queryString).filter((q) => {
            if (this.queryString[q] !== '')
                filteredQueryStr[q] = this.queryString[q]
        })

        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(p => delete filteredQueryStr[p])

        let queryStr = JSON.stringify(filteredQueryStr)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`)

        this.query.find(JSON.parse(queryStr))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortQuery = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortQuery)
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this
    }

    limitFields() {
        if (this.queryString.fields) {
            const fieldsQuery = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fieldsQuery)
        } else {
            this.query = this.query.select('-__v')
        }
        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 10
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this
    }

}

module.exports = ApiFeatures
