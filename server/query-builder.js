import error from './errors.js'

export function applyFilter(query, filter, table, junction = ':and') {
    if (Array.isArray(filter)) {
        for (const subFilter of filter) {
            query[method(junction, 'where')](
                builder => applyFilter(builder, subFilter, table)
            )
        }
    } else if (typeof filter === 'object' && filter !== null) {
        if (':and' in filter) {
            if (Object.keys(filter).length != 1) throw new error.DBWrongFilter()

            applyFilter(query, filter[':and'], table, ':and')
        } else if (':or' in filter) {
            if (Object.keys(filter).length != 1) throw new error.DBWrongFilter()

            applyFilter(query, filter[':or'], table, ':or')
        } else {
            for (const [field, value] of Object.entries(filter)) {
                query[method(junction, 'where')](
                    builder => applyFieldFilter(builder, table, junction, field, value)
                )
            }
        }
    } else throw new error.DBWrongFilter()
}

export function applyOptions(query, options, table) {
    if ('limit' in options) query.limit(options.limit)
    if ('offset' in options) query.offset(options.offset)
    if ('order' in options) applyOrder(query, options, table)
}

function applyFieldFilter(query, table, junction, field, condition) {
    if (field.indexOf('.') < 0) field = `${table}.${field}`

    if (Array.isArray(condition)) {
        query[method(junction, 'whereIn')](field, condition)
    } else if (typeof condition === 'object' && condition !== null) {
        for (const [comparator, value] of Object.entries(condition)) {
            query[method(junction, 'where')](builder => {
                if (Array.isArray(value)) {
                    if (comparator === '=') builder.whereIn(field, value)
                    else if (comparator === '!=') builder.whereNotIn(field, value)
                    else throw new error.DBWrongFilter()
                } else {
                    builder.andWhere(field, comparator, value)
                }
            })
        }
    } else {
        query[method(junction, 'where')](field, condition)
    }
}

function applyOrder(query, options, table) {
    const orders = []

    for (const [column, order] of Object.entries(options.order)) {
        orders.push({column: `${table}.${column}`, order})
    }

    query.orderBy(orders)
}

function method(junction, where) {
    if (junction === ':and') return where
    else if (junction === ':or') return `or${where.replace(/^w/, 'W')}`
    else throw new error.DBWrongFilter()
}
