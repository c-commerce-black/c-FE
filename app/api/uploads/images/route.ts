import { NextRequest } from "next/server";

import { jsonError, proxyMultipart } from "@/lib/shared/api/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    return proxyMultipart({
      path: "/api/uploads/images",
      formData,
      fallbackMessage: "이미지 업로드에 실패했습니다.",
    });
  } catch {
    return jsonError("이미지 업로드 요청을 처리할 수 없습니다.");
  }
}
