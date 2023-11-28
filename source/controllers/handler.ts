import {
  getSortedHeightsList,
  decompressFile,
  getDataJSONAtHeight,
  validateHeight,
  TypeToKeyPairs,
} from "./helpers";
import { Request, Response, NextFunction } from "express";

import fs from "fs";
import path from "path";

const compressedRootPath =
  process.env.COMPRESSED_ROOT_PATH ?? "./export_assets_compressed/";
const decompressedRootPath =
  process.env.DECOMPRESSED_ROOT_PATH ?? "./export_assets_uncompressed/";
const COMPRESSED_EXTENSION = ".tar.xz";

let foundChains: string[] = fs.readdirSync(compressedRootPath)

let possibleTypes = JSON.parse(fs.readFileSync(path.join('custom-types.json'), "utf8"));

const availableHeights = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  return res.status(200).json({
    heights: getSortedHeightsList(compressedRootPath, req.params.chain),
  });
};

const availableTypes = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  if (!Object.keys(possibleTypes).includes(req.params.chain)) {
    return res.status(400).json({
      types: Object.keys(TypeToKeyPairs),
      error: "Invalid chain. Supported: " + Object.keys(possibleTypes).join(", "),
    });
  }

  return res.status(200).json({
    types: possibleTypes[req.params.chain],
  });
};

const availableChains = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  foundChains = fs.readdirSync(compressedRootPath)

  return res.status(200).json({
    chains: foundChains,
  });
};

const download = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  let height = validateHeight(compressedRootPath, req.params.chain, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
        error: "Invalid height for chain " + req.params.chain,
    });
  }

  const fileToDownload = path.join(compressedRootPath, req.params.chain, `${height}${COMPRESSED_EXTENSION}`);
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
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  let height = validateHeight(compressedRootPath, req.params.chain, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
        error: "Invalid height for chain " + req.params.chain,
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
    req.params.chain,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(req.params.chain, height, type, decompressedRootPath);
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
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  let height = validateHeight(compressedRootPath, req.params.chain, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height for chain " + req.params.chain,
    });
  }

  const type = req.params.type;
  const address = req.params.address;

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    req.params.chain,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(req.params.chain, height, type, decompressedRootPath);

  if (TypeToKeyPairs[type] === undefined) {
    return res.status(400).json({
      error: "Invalid type. Supported: " + Object.keys(TypeToKeyPairs).join(", "),
    });
  }

  const parentKey: string = TypeToKeyPairs[type][0];
  const findKey: string = TypeToKeyPairs[type][1];

  let a = data[parentKey];

  if (a === undefined) {
    return res.status(400).json({
      error: "No data found",
    });
  }

  const instances = a.filter(
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
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  let height = validateHeight(compressedRootPath, req.params.chain, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height for chain " + req.params.chain,
    });
  }

  const type = "staking";
  const valoper_address = req.params.valoper_address;

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    req.params.chain,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(req.params.chain, height, type, decompressedRootPath);

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
  if (!foundChains.includes(req.params.chain)) {
    return res.status(400).json({
      error: "Invalid chain. Supported: " + foundChains.join(", "),
    });
  }

  let height = validateHeight(compressedRootPath, req.params.chain, req.params.height.toString());
  if (!height) {
    return res.status(400).json({
      error: "Invalid height for chain " + req.params.chain,
    });
  }

  const type = "staking";

  decompressFile(
    compressedRootPath,
    COMPRESSED_EXTENSION,
    req.params.chain,
    height,
    decompressedRootPath,
  );

  const data = getDataJSONAtHeight(req.params.chain, height, type, decompressedRootPath);

  const parentKey: string = TypeToKeyPairs[type][0];

  let validator_delegations: any = {};
  let v = data[parentKey]

  if (v === undefined) {
    return res.status(400).json({
      error: "No validators found",
    });
  }

  v.forEach((obj: any) => {
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
  availableChains,
  availableTypes,
  availableHeights,
  getDataAtHeight,
  getUserAtHeight,
  getDelegationsTo,
  getValidators,
  download,
};

