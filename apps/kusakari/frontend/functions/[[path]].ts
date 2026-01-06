import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";
// @ts-expect-error ビルド時に生成されるため型チェックを抑制する
import * as buildModule from "../build/server/index.js";

export const onRequest = createPagesFunctionHandler({
  build: buildModule as unknown as ServerBuild,
});
