import {
  getSortedHeightsList,
  decompressFile,
  getDataJSONAtHeight,
  validateHeight,
  TypeToKeyPairs,
} from "./helpers";
import { Request, Response, NextFunction } from "express";

const compressedRootPath =
  process.env.COMPRESSED_ROOT_PATH ?? "./export_assets_compressed/";
const decompressedRootPath =
  process.env.DECOMPRESSED_ROOT_PATH ?? "./export_assets_uncompressed/";
const COMPRESSED_EXTENSION = ".tar.xz";

const avaliableHeights = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  return res.status(200).json({
    heights: getSortedHeightsList(compressedRootPath),
  });
};

const avaliableTypes = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  return res.status(200).json({
    types: Object.keys(TypeToKeyPairs),
  });
};

const download = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let height = validateHeight(compressedRootPath, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height",
    });
  }
  
  const fileToDownload = `${compressedRootPath}${height}${COMPRESSED_EXTENSION}`;
  const customFilename = `${height}${COMPRESSED_EXTENSION}`;  

  const options = {
    headers : {
      'Content-Type': 'application/x-tar',
    }      
  }


  res.download(fileToDownload, customFilename, options);

  return res.status(200)
};

const getDataAtHeight = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let height = validateHeight(compressedRootPath, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height",
    });
  }
  let type = req.params.type;

  let isSupply: boolean = type === "supply";
  if (isSupply) {
    type = "bank";
  }

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(height, type, decompressedRootPath);
  if (data.error) {
    return res.status(400).json({
      error: data.error,
    });
  }

  if (isSupply) {
    return res.status(200).json({
      height: height,
      request: "supply",
      supply: data.supply,
    });
  }

  return res.status(200).json({
    data,
  });
};

const getUserAtHeight = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let height = validateHeight(compressedRootPath, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height",
    });
  }

  const type = req.params.type;
  const address = req.params.address;

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(height, type, decompressedRootPath);

  const parentKey: string = TypeToKeyPairs[type][0];
  const findKey: string = TypeToKeyPairs[type][1];

  const instances = data[parentKey].filter(
    (obj: any) => obj[findKey] === address,
  );

  if (instances === undefined) {
    return res.status(400).json({
      error: "Wallet data not found.",
    });
  }

  return res.status(200).json({
    height: height,
    request: type,
    instances,
  });
};

// TODO: Merge into above function
const getDelegationsTo = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let height = validateHeight(compressedRootPath, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height",
    });
  }

  const type = "staking";
  const valoper_address = req.params.valoper_address;

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(height, type, decompressedRootPath);

  const parentKey: string = TypeToKeyPairs[type][0];
  const instances = data[parentKey].filter(
    (obj: any) => obj.validator_address === valoper_address,
  );

  if (instances === undefined) {
    return res.status(400).json({
      error: "Valoper address not found",
    });
  }

  return res.status(200).json({
    height: height,
    request: "delegations",
    amount: instances.length,
    instances,
  });
};

const getValidators = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let height = validateHeight(compressedRootPath, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height",
    });
  }

  const type = "staking";

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(height, type, decompressedRootPath);

  const parentKey: string = TypeToKeyPairs[type][0];

  let validator_delegations: any = {};
  data[parentKey].forEach((obj: any) => {
    if (!validator_delegations[obj.validator_address]) {
      validator_delegations[obj.validator_address] = 0;
    }

    validator_delegations[obj.validator_address] += Number(obj.shares);
  });

  validator_delegations = Object.entries(validator_delegations).sort(
    (a: any, b: any) => {
      return b[1] - a[1];
    },
  );

  let total_delegated: number = 0;
  validator_delegations.forEach((obj: any) => {
    total_delegated += obj[1];
  });

  if (validator_delegations.length === 0) {
    return res.status(400).json({
      error: "No validators found",
    });
  }

  return res.status(200).json({
    height: height,
    request: "validators",
    total_delegated,
    validator_delegations,
  });
};

export default {
  avaliableTypes,
  avaliableHeights,
  getDataAtHeight,
  getUserAtHeight,
  getDelegationsTo,
  getValidators,
  download,
};
