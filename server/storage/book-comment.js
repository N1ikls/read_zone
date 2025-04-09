import BaseComment from './base-comment.js'

export default class extends BaseComment {
  get table() { return 'book_comment' }
  get tableLiker() { return 'book_comment_liker' }

  get entityIdProperty() { return 'book_id' }
}
