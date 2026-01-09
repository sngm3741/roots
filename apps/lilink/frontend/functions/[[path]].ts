// @ts-ignore ビルド成果物の型は JS のみ
import { createPagesFunctionHandler } from "@react-router/cloudflare";
// @ts-ignore ビルド時に生成される
import * as buildModule from "../build/server/index.js";
import type { ServerBuild } from "react-router";

export const onRequest = createPagesFunctionHandler({
  build: buildModule as ServerBuild,
  mode: process.env.NODE_ENV,
});
