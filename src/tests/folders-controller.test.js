const {
  createFolder,
  deleteFolder,
  getFolderInfo,
  editFolderName
} = require('../controller/folders.controller');
const { errorsCodes } = require('../consts/server-codes');

jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.text.replace(/\s+/gi, '');
    const stringValues = query.values.toString();

    if (replacedQuery === 'SELECT*FROMfoldersWHERE"creator_id"=$1AND"origin_folder_id"ISNULLAND"name"=$2LIMIT1') {
      if (stringValues === '1,folder') {
        return { rows: [] }
      }
      if (stringValues === '2,folder') {
        return { rows: [{
          id: 2,
          name: 'folder',
          originFolderId: 0
        }] }
      }
    }
    if (replacedQuery === 'SELECT*FROMfoldersWHERE"creator_id"=$1AND"id"=$2LIMIT1') {
      if (stringValues === '2,1') {
        return { rows: [{
          id: 2,
          name: 'folder',
          originFolderId: 0
        }] }
      }
      if (stringValues === '2,2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'SELECT*FROMfoldersWHERE"creator_id"=$1AND"origin_folder_id"=$2AND"name"=$3LIMIT1') {
      if (stringValues === '2,1,folder2') {
        return { rows: [] }
      }
      if (stringValues === '2,1,folder') {
        return { rows: [{
          id: 2,
          name: 'folder',
          originFolderId: 1
        }] }
      }
    }
    if (replacedQuery === 'INSERTINTOfolders("name","origin_folder_id","creator_id")VALUES($1,$2,$3)RETURNING"id","name","origin_folder_id"as"originFolderId"') {
      if (stringValues === 'folder,,1') {
        return { rows: [{
          id: 1,
          name: 'folder',
          originFolderId: 0
        }] }
      }
      if (stringValues === 'folder2,1,2') {
        return { rows: [{
          id: 2,
          name: 'folder',
          originFolderId: 1
        }] }
      }
    }
    if (replacedQuery === 'WITHRECURSIVEfolders_recursive("distance","origin_folder_id","id")AS(SELECT1,"origin_folder_id","id"FROMfoldersWHERE"origin_folder_id"=$1UNIONALLSELECTfr.distance+1,f.origin_folder_id,f.idFROMfolders_recursivefr,foldersfWHEREfr.id=f.origin_folder_id)SELECTDISTINCTfl.id,fl.pathFROMfolders_recursiveASfsJOIN(SELECT*FROMfiles)asflonfl.folder_id=fs.idORfl.folder_id=$1') {
      if (stringValues === '1') {
        return  { rows: [
          {
            path: '/',
            id: 1
          },
          {
            path: '/',
            id: 2
          },
          {
            path: '/',
            id: 3
          }
        ]}
      }
    }
    if (replacedQuery === 'SELECTid,name,COALESCE(origin_folder_id,0)as"originFolderId",creator_idas"creatorId"FROMfoldersWHERE"id"=$1AND"creator_id"=$2LIMIT1') {
      if (stringValues === '1,2') {
        return { rows: [{
          id: 1,
          name: 'folder',
          originFolderId: 0
        }] }
      }
      if (stringValues === '2,2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'SELECTid,name,origin_folder_idas"originFolderId",creator_idas"creatorId"FROMfoldersWHERE"origin_folder_id"=$1AND"creator_id"=$2') {
      if (stringValues === '1,2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'SELECTid,name,origin_folder_idas"originFolderId",creator_idas"creatorId"FROMfoldersWHERE"origin_folder_id"ISNULLAND"creator_id"=$1') {
      if (stringValues === '2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'SELECTid,displaynameas"displayName",type,creator_idas"creatorId"FROMfilesWHERE"folder_id"ISNULLAND"creator_id"=$1') {
      if (stringValues === '2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'SELECTid,displaynameas"displayName",type,creator_idas"creatorId"FROMfilesWHERE"folder_id"=$1AND"creator_id"=$2') {
      if (stringValues === '1,2') {
        return { rows: [] }
      }
    }
  }
}));

jest.mock('fs', () => ({
  promises: {
    unlink: () => {},
    writeFile: () => {},
    rm:  () => {}
  }
}));

const res = {
  text: '',
  statusCode: 200,
  status: (status) => {
    res.statusCode = status;
    return {
      send: (input) => {
        res.text = input;
      }
    }
  }
};

describe('createFolder', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 201 and folder info (1)', async () => {
    const req = {
      body: {
        folderName: 'folder',
        originFolderId: 0
      },
      user: {
        id: 1
      }
    };

    await createFolder(req, res);

    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual({
      id: 1,
      name: 'folder',
      originFolderId: 0
    });
  })
  it('should return code 201 and folder info (2)', async () => {
    const req = {
      body: {
        folderName: 'folder2',
        originFolderId: 1
      },
      user: {
        id: 2
      }
    };

    await createFolder(req, res);

    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual({
      id: 2,
      name: 'folder',
      originFolderId: 1
    });
  })
  it('should return code 500 and error code "FOLDER_EXIST" (1)', async () => {
    const req = {
      body: {
        folderName: 'folder',
        originFolderId: 1
      },
      user: {
        id: 2
      }
    };

    await createFolder(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.folderExist
    });
  })
  it('should return code 500 and error code "FOLDER_EXIST" (2)', async () => {
    const req = {
      body: {
        folderName: 'folder',
        originFolderId: 0
      },
      user: {
        id: 2
      }
    };

    await createFolder(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.folderExist
    });
  })
  it('should return code 500 and error code "INVALID_FOLDER"', async () => {
    const req = {
      body: {
        folderName: 'folder',
        originFolderId: 2
      },
      user: {
        id: 2
      }
    };

    await createFolder(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.invalidFolder
    });
  })
});

describe('deleteFolder', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 200 and message "success delete folder"', async () => {
    const req = {
      query: {
        folderId: 1
      },
      user: {
        id: 2
      }
    };

    await deleteFolder(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      message: 'success delete folder'
    });
  })
  it('should return code 500 and error code "INVALID_FOLDER"', async () => {
    const req = {
      query: {
        folderId: 2
      },
      user: {
        id: 2
      }
    };

    await deleteFolder(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.invalidFolder
    });
  })
});

describe('getFolderInfo (getRootFolder)', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 200 and root folder info', async () => {
    const req = {
      query: {
        folderId: '0'
      },
      user: {
        id: 2
      }
    };

    await getFolderInfo(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      id: 0,
      name: 'root',
      originFolderId: null,
      creatorId: 2,
      folders: [],
      files: []
    });
  })
});

describe('getFolderInfo (getOtherFolder)', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 200 and folder info', async () => {
    const req = {
      query: {
        folderId: 1
      },
      user: {
        id: 2
      }
    };

    await getFolderInfo(req, res);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      id: 1,
      name: 'folder',
      originFolderId: 0,
      folders: [],
      files: []
    });
  })
  it('should return code 500', async () => {
    const req = {
      query: {
        folderId: 2
      },
      user: {
        id: 2
      }
    };

    await getFolderInfo(req, res);
    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.invalidFolder
    });
  })
});

describe('editFolderName', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 200 and message "success folder name edit"', async () => {
    const req = {
      body: {
        folderId: 1,
        newName: 'newFolder'
      },
      user: {
        id: 2
      }
    };

    await editFolderName(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      message: 'success folder name edit'
    });
  })
  it('should return code 500 and error code "INVALID_FOLDER"', async () => {
    const req = {
      body: {
        folderId: 2,
        newName: 'newFolder'
      },
      user: {
        id: 2
      }
    };

    await editFolderName(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.invalidFolder
    });
  })
});
