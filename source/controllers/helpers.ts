import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export enum Type {
  AUTH = "auth",
  BANK = "bank",
  SUPPLY = "supply", // bank
  STAKING = "staking",
  VALIDATORS = "validators", // staking
}

// pairs the type -> the main key and object key in the data to filter by.
// typename -> [parentKey, searchKey]
export const TypeToKeyPairs: any = {
  bank: ["balances", "address"],
  supply: ["supply", "denom"], // bank sub key
  staking: ["delegations", "delegator_address"],
  validators: ["delegations", "validator_address"], // staking subset
  auth: ["accounts", "address"],
};

export enum FileByType {
  AUTH = "_auth.json",
  BANK = "_bank.json",
  STAKING = "_staking.json",
}

const getFileNameByType = (type: Type): string | undefined => {
  if (type === Type.AUTH) {
    return FileByType.AUTH;
  } else if (type === Type.BANK) {
    return FileByType.BANK;
  } else if (type === Type.STAKING) {
    return FileByType.STAKING;
  }
};

// TODO: .
const isFileDecompressed = (
  decompressedRootPath: string,
  height: string, 
): boolean => {
  const decompressedPath = path.join(decompressedRootPath, height);
  return fs.existsSync(decompressedPath);
};

const getSortedHeightsList = (compressedRootPath: string): number[] => {
  const height_list: number[] = [];

  fs.readdirSync(compressedRootPath).forEach((file: any) => {
    const height = file.substring(0, file.indexOf("."));
    const height_int = Number(height);
    height_list.push(height_int);
  });

  // sort in descending order
  const sorted_height_list = height_list.sort(function (a, b) {
    return b - a;
  });

  return sorted_height_list;
};

const validateHeight = (
  compressedRootPath: string,
  height: string,
): string | undefined => {
  if (height === ":height") {
    return undefined;
  }

  const heights: number[] = getSortedHeightsList(compressedRootPath);

  // Stars with:
  if (height === "l" || height === "latest") {
    return heights[0].toString();
  }

  // earliest value

  if (isNaN(Number(height))) {    
    return heights[0].toString();
  }

  return height;
};

const decompressFile = (
  compressedRootPath: string,
  compressed_ext: string,
  height: string,
  decompressedRootPath: string,
): boolean => {
  const file = path.join(compressedRootPath, height + compressed_ext);

  // cache
  if (isFileDecompressed(decompressedRootPath, height)) {
    return true;
  }

  const decompressCommand = `tar -xzf ${file} -C ${decompressedRootPath}`;

  try {
    execSync(decompressCommand);
    return true;
  } catch (error) {
    console.log("output", error);
    return false;
  }
};

const getDataJSONAtHeight = (
  height: string,
  type: string,
  decompressedRootPath: string,
): any => {  
  const filePath = path.join(
    decompressedRootPath,
    height,
    `${height}_${type}.json`,
  );

  if (!Object.values(Type).includes(type as Type)) {
    return {
      error: "Type does not exist. Valid: " + Object.values(Type).join(", "),
    };
  }

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  return {
    error: `Height: ${height} does not exist. (Use /heights to see avaliable heights)`,
  };
};

export {
  getSortedHeightsList,
  getFileNameByType,
  isFileDecompressed,
  decompressFile,
  validateHeight,
  getDataJSONAtHeight,
};
