import BaseStorage from './base-storage.js'
import errors from '../errors.js'

export default class extends BaseStorage {
  get table() { return 'team' }
  get tableComment() { return 'team_comment' }
  get tableLiker() { return 'team_liker' }
  get tableSocial() { return 'team_social' }
  get tableSubscriber() { return 'team_subscriber' }
  get tableTeammate() { return 'team_teammate' }

  get publicProperties() {
    return [
      'id',
      'name',
      'description',
      'avatar',
      'background',
      'books_count',
      'chapters_in_month',
      'likers_count',
      'subscribers_count',
      'books',
    ]
  }

  beforeSave(team, user) {
    if (!team.id) {
      if (!('name' in team)) throw new errors.DBValidation([{field: 'name', message: 'У команды должно быть название'}])
    }

    const data = {}

    if ('name' in team) {
      if (typeof(team.name) !== 'string') throw new errors.DBValidation([{field: 'name', message: 'Название команды должно быть строкой'}])
      if (team.name.length === 0) throw new errors.DBValidation([{field: 'name', message: 'Название должно быть заполнено'}])
      data.name = team.name
    }

    if ('description' in team) {
      if (team.description === null) data.description = team.description
      else {
        if (typeof(team.description) !== 'string') throw new errors.DBValidation([{field: 'description', message: 'Описание должно быть строкой или NULL'}])

        const description = team.description.trim()
        data.description = description.length ? description : null
      }
    }

    if ('avatar' in team) data.avatar = team.avatar
    if ('background' in team) data.background = team.background

    if (team.id) {
      data.updated_at = this.fixDate(new Date())
      data.updated_by = user.id
    } else data.created_by = user.id

    return data
  }

  async getBooks(team) {
    return this.knex('book')
      .innerJoin('user', 'user.id', 'book.translator_id')
      .innerJoin(this.tableTeammate, `${this.tableTeammate}.user_id`, 'user.id')
      .where(`${this.tableTeammate}.team_id`, team.id)
      .select('book.*')
  }

  async getComments(team) {
    return this.knex(this.tableComment)
      .leftJoin('user', 'user.id', `${this.tableComment}.created_by`)
      .where('team_id', team.id)
      .orderBy('created_at')
      .select(`${this.tableComment}.*`, 'user.name as user_name')
  }

  async getTeammates(team) {
    const [creator, teammates] = await Promise.all([
      this.knex('user')
        .where('id', team.created_by)
        .select('user.*', this.knex.raw('"creator" as team_role')),
      this.knex('user')
        .innerJoin(this.tableTeammate, `${this.tableTeammate}.user_id`, `user.id`)
        .where(`${this.tableTeammate}.team_id`, team.id)
        .select('user.*', `${this.tableTeammate}.role as team_role`)
    ])

    return [creator[0], ...teammates]
  }

  async isWriteable(team, user) {
    if (!user) return false
    if (user.role === 'admin') return true
    if (team.created_by === user.id) return true

    return false
  }
}
