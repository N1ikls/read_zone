import BaseComment from './base-comment.js'

export default class extends BaseComment {
  get table() { return 'team_comment' }
  get tableLiker() { return 'team_comment_liker' }

  get entityIdProperty() { return 'team_id' }
}
