import fs from "fs";
import { execSync } from "child_process";
import { Request, Response, NextFunction } from "express";

const compressedRootPath = "./export_assets_compressed/";
const decompressedRootPath = "./export_assets_uncompressed/";
const compressedExtension = ".tar.xz";

const getFileNameByType = (type: Type): string | undefined => {
  if (type === Type.AUTH) {
    return FileByType.AUTH;
  } else if (type === Type.BANK) {
    return FileByType.BANK;
  } else if (type === Type.STAKING) {
    return FileByType.STAKING;
  }
};

export enum Type {
  AUTH = "auth",
  BANK = "bank",
  STAKING = "staking",
}

export enum FileByType {
  AUTH = "_auth.json",
  BANK = "_bank.json",
  STAKING = "_staking.json",
}

const getLatestHeightFromCompressedFolder = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  console.log("passou aqui");
  const height_list: number[] = [];
  fs.readdirSync(compressedRootPath).forEach((file: any) => {
    const height = file.substring(0, file.indexOf("."));
    const height_int = Number(height);
    height_list.push(height_int);
  });
  console.log(height_list);
  const sorted_height_list = height_list.sort(function (a, b) {
    return b - a; // sort in descending order
  });

  console.log(sorted_height_list[0]?.toString());

  return res.status(200).json({
    height: sorted_height_list[0]?.toString(),
  });
};

const isFileDecompressed = (height: string): boolean => {
  /* const typeFolderPath = getFolderByType(type);
  if (!typeFolderPath) throw new Error("Type not recognised"); */
  const decompressedPath = decompressedRootPath;
  const file = fs.readdirSync(decompressedPath).find((fileName) => {
    /*  const height_decompressed = fileName.substring(0, fileName.indexOf("."));
    if (height_decompressed === undefined)
      throw new Error("Error creating substring of decompressed file");
 */
    //console.log(fileName === height);
    //console.log(height);
    return fileName === height;
  });
  // if (file === undefined) return false else return true;

  return file === undefined ? false : true;
};

const isHeightAvailable = (height: string): boolean => {
  const file = fs.readdirSync(compressedRootPath).find((fileName) => {
    const height_decompressed = fileName.substring(0, fileName.indexOf("."));
    if (height_decompressed === undefined)
      throw new Error("Error creating substring of decompressed file");

    return height_decompressed === height;
  });

  return file === undefined ? false : true;
};

const getDecompressedJsonData = (type: Type, height: string): any => {
  const typeFolderPath = getFileNameByType(type);
  if (!typeFolderPath) throw new Error("Type not recognised");
  const decompressedPathToHeightFolder = decompressedRootPath + height + "/";

  let file = undefined;
  try {
    file = fs.readFileSync(
      decompressedPathToHeightFolder + height + typeFolderPath,
      "utf8"
    );
  } catch (error) {
    return file;
  }

  var jsonResult = JSON.parse(file);

  return jsonResult;
};

const decompressFile = (height: string) => {
  console.log(compressedRootPath + height + compressedExtension);
  try {
    execSync(
      `tar -xJf ${
        compressedRootPath + height + compressedExtension
      } -C ${decompressedRootPath}`
      /* (error) => {
      if (error) {
        console.error(`Error extracting the tar.xz file: ${error.message}`);
      } else {
        console.log("Successfully extracted the tar.xz file.");
      }
    } */
    );
  } catch (error) {
    console.log("output", error);
  }
};

const getDecompressedJsonDataByHeightAndType = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let height: string = req.params.height;
  let type = req.params.type as Type;

  // check if height file exists compressed
  const heightAvailable = isHeightAvailable(height);
  //console.log("heightAvailable: ", heightAvailable);
  // check if height file exists decompressed
  const decompressedExists = isFileDecompressed(height);
  //console.log("decompressing");
  // if not, decompress
  if (!decompressedExists && heightAvailable) {
    //console.log("decompressedExists: ", decompressedExists);
    const result = decompressFile(height);
  }
  //console.log("decompressed... ");
  // return json data
  let data;
  try {
    data = getDecompressedJsonData(type, height);
    if (data === undefined)
      return res.status(400).json({
        message: "File not found",
      });
  } catch (error) {
    return res.status(400).json({
      message: "Error while getting uncompressed file",
    });
  }

  return res.status(200).json({
    data,
  });
};

const getFilteredDataByAddress = (
  data: any,
  type: Type,
  address: string
): any[] => {
  let searchResult: any[] = [];
  switch (type) {
    case Type.AUTH:
      ifNullOrUndefinedDoNothing(
        data.accounts.find((account: any) => account.address === address),
        searchResult
      );
      break;
    case Type.BANK:
      ifNullOrUndefinedDoNothing(
        data.balances.find((balance: any) => balance.address === address),
        searchResult
      );
      break;
    case Type.STAKING:
      ifNullOrUndefinedDoNothing(
        data.delegations.filter(
          (delegation: any) => delegation.delegator_address === address
        ),
        searchResult
      );
  }

  return searchResult;
  // search bank file for all addresses
};

const ifNullOrUndefinedDoNothing = (data: any, results: any[]) => {
  if (data === null || data === undefined) {
    return [];
  } else {
    return results.push(data);
  }
};

const getDecompressedJsonDataByHeightTypeAndAddress = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let height: string = req.params.height;
  let type = req.params.type as Type;
  let address = req.params.address;

  // check if height file exists compressed
  const heightAvailable = isHeightAvailable(height);
  //console.log("heightAvailable: ", heightAvailable);
  // check if height file exists decompressed
  const decompressedExists = isFileDecompressed(height);
  //console.log("decompressing");
  // if not, decompress
  if (!decompressedExists && heightAvailable) {
    //console.log("decompressedExists: ", decompressedExists);
    const result = decompressFile(height);
  }
  //console.log("decompressed... ");
  // return json data
  let data: string | undefined;
  try {
    data = getDecompressedJsonData(type, height);
    if (data === undefined)
      return res.status(400).json({
        message: "File not found",
      });
  } catch (error) {
    return res.status(400).json({
      message: "Error while getting uncompressed file",
    });
  }

  const filteredData = getFilteredDataByAddress(data, type, address);

  return res.status(200).json({
    filteredData,
  });
};

/* const latestCompressed = getLatestHeightFromCompressedFolder();
console.log(latestCompressed);

const decompressedExists = isFileDecompressed(latestCompressed);
console.log(decompressedExists);

if (decompressedExists) {
  const jsonData = getDecompressedJsonData(Type.AUTH, latestCompressed);
  console.log(jsonData);
} */

//decompressFile("6440000");

export default {
  getLatestHeightFromCompressedFolder,
  isFileDecompressed,
  getDecompressedJsonData,
  decompressFile,
  getDecompressedJsonDataByHeightAndType,
  getDecompressedJsonDataByHeightTypeAndAddress,
};
