import { CreateBookmarkDto } from '../dto/create-bookmark.dto';
import { UpdateBookmarkDto } from '../dto/update-bookmark.dto';
import { Channel } from '../schema/channel.schema';
import { BookmarkFolder } from '../schema/types/bookmark-folder.type';
import { Bookmark } from '../schema/types/bookmark.type';

const ChannelHelper = {
  addBookmarkFolder: async (channel: Channel, folderName: string) => {
    const folder = {
      name: folderName,
      bookmarks: [],
    };
    const isExist = channel.bookmarkFolders.findIndex(
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

  addBookmark: async (channel: Channel, payload: CreateBookmarkDto) => {
    const folderName = payload.folderName;
    // Single bookmark
    if (!folderName) {
      const isExist = channel.bookmarks.findIndex(
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
      const folderIndex = channel.bookmarkFolders.findIndex(
        (bookmarkFolder) => bookmarkFolder.name === folderName,
      );
      if (folderIndex === -1) {
        return {
          message: 'Bookmark folder not found',
          code: -1,
        };
      }
      // Check bookmark already exist in folder ?
      const isExistBookmark = channel.bookmarkFolders[
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
      channel.bookmarkFolders[folderIndex].bookmarks.push(resData);
      return {
        code: 2,
        updatedFolder: channel.bookmarkFolders[folderIndex],
        folderIndex,
      };
    }
  },

  updateBookmarkFolder: async (
    channel: Channel,
    previousName: string,
    newName: string,
  ) => {
    const folderIndex = channel.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === previousName,
    );
    if (folderIndex === -1) {
      return {
        message: 'Bookmark folder not found',
        code: -1,
      };
    }
    const isExist = channel.bookmarkFolders.findIndex(
      (bookmarkFolder) => bookmarkFolder.name === newName,
    );
    if (isExist !== -1) {
      return {
        message: 'Bookmark folder already exists',
        code: -1,
      };
    }
    const updatedFolder: BookmarkFolder = {
      ...channel.bookmarkFolders[folderIndex],
      name: newName,
    };
    channel.bookmarkFolders[folderIndex] = updatedFolder;
    return {
      code: 1,
      message: 'Success',
    };
  },

  updateBookmark: async (channel: Channel, payload: UpdateBookmarkDto) => {
    const folderName = payload.folderName;
    const newBookmark: Bookmark = {
      name: payload.name,
      url: payload.url,
      thumbnail: payload.thumbnail,
    };
    if (!folderName) {
      const bookmarkIndex = channel.bookmarks.findIndex(
        (bookmark) => bookmark.name === payload.previousName,
      );
      if (bookmarkIndex === -1) {
        return {
          message: 'Bookmark not found',
          code: -1,
        };
      }
      channel.bookmarks[bookmarkIndex] = newBookmark;
      return {
        code: 1,
        message: 'Success',
      };
    }

    // Update bookmark in folder
    if (folderName) {
      const folderIndex = channel.bookmarkFolders.findIndex(
        (bookmarkFolder) => bookmarkFolder.name === folderName,
      );
      if (folderIndex === -1) {
        return {
          message: 'Bookmark folder not found',
          code: -1,
        };
      }

      const bookmarkIndex = channel.bookmarkFolders[
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

      channel.bookmarkFolders[folderIndex].bookmarks[bookmarkIndex] =
        newBookmark;
      const updatedFolder: BookmarkFolder = {
        ...channel.bookmarkFolders[folderIndex],
        bookmarks: channel.bookmarkFolders[folderIndex].bookmarks,
      };
      channel.bookmarkFolders[folderIndex] = updatedFolder;
      return {
        code: 1,
        message: 'Success',
      };
    }
  },

  deleteBookmark: async (
    channel: Channel,
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

    channel.bookmarkFolders[folderIndex].bookmarks.splice(bookmarkIndex, 1);
  },

  deleteBookmarkFolder: async (channel: Channel, folderName: string) => {
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
