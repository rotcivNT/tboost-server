import { CreateBookmarkDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/create-bookmark.dto';
import { Channel } from '../schema/channel.schema';
import { BookmarkFolder } from '../types/bookmark-folder.type';
import { Bookmark } from '../types/bookmark.type';
import { UpdateBookmarkDto } from 'apps/api-gateway/src/dtos/conversation-dto/channel-dto/update-bookmark.dto';
import { DirectConversation } from '../schema/direct-conversation.schema';

const ChannelHelper = {
  addBookmarkFolder: async (
    conversation: Channel | DirectConversation,
    folderName: string,
  ) => {
    const folder = {
      name: folderName,
      bookmarks: [],
    };
    const isExist = conversation.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === folderName,
    );

    if (isExist !== -1) {
      return {
        message: 'Bookmark folder already exists',
        code: -1,
      };
    }
    return {
      code: 1,
      data: folder,
    };
  },

  addBookmark: async (
    conversation: Channel | DirectConversation,
    payload: CreateBookmarkDto,
  ) => {
    const folderName = payload.folderName;

    // Single bookmark
    if (!folderName) {
      const isExist = conversation.bookmarks.findIndex(
        (bookmark) => bookmark.name === payload.name,
      );
      if (isExist !== -1) {
        return {
          message: 'Bookmark folder already exists',
          code: -1,
        };
      }
      return {
        code: 1,
        data: payload,
      };
    }

    if (folderName) {
      const folderIndex = conversation.bookmarkFolders.findIndex(
        (bookmarkFolder) => bookmarkFolder.name === folderName,
      );

      if (folderIndex === -1) {
        return {
          message: 'Bookmark folder not found',
          code: -1,
        };
      }
      // Check bookmark already exist in folder ?
      const isExistBookmark = conversation.bookmarkFolders[
        folderIndex
      ].bookmarks.findIndex((bookmark) => bookmark.name === payload.name);
      if (isExistBookmark !== -1) {
        return {
          message: 'Bookmark already exists in folder',
          code: -1,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { folderName: haveFolderName, ...resData } = payload;
      conversation.bookmarkFolders[folderIndex].bookmarks.push(resData);
      return {
        code: 2,
        updatedFolder: conversation.bookmarkFolders[folderIndex],
        folderIndex,
      };
    }
  },

  updateBookmarkFolder: async (
    conversation: Channel | DirectConversation,
    previousName: string,
    newName: string,
  ) => {
    const folderIndex = conversation.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === previousName,
    );
    if (folderIndex === -1) {
      return {
        message: 'Bookmark folder not found',
        code: -1,
      };
    }
    const isExist = conversation.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === newName,
    );
    if (isExist !== -1) {
      return {
        message: 'Bookmark folder already exists',
        code: -1,
      };
    }
    const updatedFolder: BookmarkFolder = {
      ...conversation.bookmarkFolders[folderIndex],
      name: newName,
    };
    conversation.bookmarkFolders[folderIndex] = updatedFolder;
    return {
      code: 1,
      message: 'Success',
    };
  },

  updateBookmark: async (
    conversation: Channel | DirectConversation,
    payload: UpdateBookmarkDto,
  ) => {
    const folderName = payload.folderName;
    const newBookmark: Bookmark = {
      name: payload.name,
      url: payload.url,
      thumbnail: payload.thumbnail,
    };
    if (!folderName) {
      const bookmarkIndex = conversation.bookmarks.findIndex(
        (bookmark) => bookmark.name === payload.previousName,
      );
      if (bookmarkIndex === -1) {
        return {
          message: 'Bookmark not found',
          code: -1,
        };
      }
      conversation.bookmarks[bookmarkIndex] = newBookmark;
      return {
        code: 1,
        message: 'Success',
      };
    }

    // Update bookmark in folder
    if (folderName) {
      const folderIndex = conversation.bookmarkFolders.findIndex(
        (bookmarkFolder) => bookmarkFolder.name === folderName,
      );
      if (folderIndex === -1) {
        return {
          message: 'Bookmark folder not found',
          code: -1,
        };
      }

      const bookmarkIndex = conversation.bookmarkFolders[
        folderIndex
      ].bookmarks.findIndex(
        (bookmark) => bookmark.name === payload.previousName,
      );
      if (bookmarkIndex === -1) {
        return {
          message: 'Bookmark not found',
          code: -1,
        };
      }

      conversation.bookmarkFolders[folderIndex].bookmarks[bookmarkIndex] =
        newBookmark;
      const updatedFolder: BookmarkFolder = {
        ...conversation.bookmarkFolders[folderIndex],
        bookmarks: conversation.bookmarkFolders[folderIndex].bookmarks,
      };
      conversation.bookmarkFolders[folderIndex] = updatedFolder;
      return {
        code: 1,
        message: 'Success',
      };
    }
  },

  deleteBookmark: async (
    channel: Channel | DirectConversation,
    bookmarkName: string,
    parentName: string,
  ) => {
    if (!parentName) {
      const bookmarkIndex = channel.bookmarks.findIndex(
        (bookmark) => bookmark.name === bookmarkName,
      );
      if (bookmarkIndex === -1) {
        return {
          message: 'Bookmark not found',
          code: -1,
        };
      }
      channel.bookmarks.splice(bookmarkIndex, 1);
      return {
        code: 1,
        message: 'Success',
      };
    }

    const folderIndex = channel.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === parentName,
    );

    if (folderIndex === -1) {
      return {
        message: 'Bookmark folder not found',
        code: -1,
      };
    }

    const bookmarkIndex = channel.bookmarkFolders[
      folderIndex
    ].bookmarks.findIndex((bookmark) => bookmark.name === bookmarkName);

    if (bookmarkIndex === -1) {
      return {
        message: 'Bookmark not found',
        code: -1,
      };
    }
    const updatedFolder = channel.bookmarkFolders[folderIndex];
    updatedFolder.bookmarks.splice(bookmarkIndex, 1);
    channel.bookmarkFolders[folderIndex] = updatedFolder;
    return {
      code: 1,
      message: 'Success',
    };
  },

  deleteBookmarkFolder: async (
    channel: Channel | DirectConversation,
    folderName: string,
  ) => {
    const folderIndex = channel.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === folderName,
    );
    if (folderIndex === -1) {
      return {
        message: 'Bookmark folder not found',
        code: -1,
      };
    }
    channel.bookmarkFolders.splice(folderIndex, 1);
    return {
      code: 1,
      message: 'Success',
    };
  },
};

export default ChannelHelper;
