import errors from '~/errors.js'

const options = {
  author: {
    storage: 'author',
    media: {
      newAvatar: 'avatar'
    }
  },

  book: {
    storage: 'book',
    commentStorage: 'bookComment',
    media: {
      newBackground: 'background',
    }
  },

  'book-comment': {
    storage: 'bookComment',
  },

  chapter: {
    storage: 'chapter',
    commentStorage: 'chapterComment',
  },

  'chapter-comment': {
    storage: 'chapterComment'
  },

  'chapter-error': {
    storage: 'chapterError'
  },

  team: {
    storage: 'team',
    commentStorage: 'teamComment',
    media: {
      newAvatar: 'avatar',
      newBackground: 'background',
    }
  },

  'team-comment': {
    storage: 'teamComment',
  },

  user: {
    storage: 'user',
    media: {
      newAvatar: 'avatar'
    }
  }
}

export default function getEntityTypeOptions(event, type) {
  if (!(type in options)) throw new errors.NotFound()

  const option = options[type]

  return {
    storage: event.context.storage[option.storage],
    commentStorage: event.context.storage?.[option.commentStorage],
    media: option.media,
  }
}
