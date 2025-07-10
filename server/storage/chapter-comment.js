import BaseComment from './base-comment.js'

export default class extends BaseComment {
  get table() { return 'chapter_comment' }
  get tableLiker() { return 'chapter_comment_liker' }

  get entityIdProperty() { return 'chapter_id' }
}