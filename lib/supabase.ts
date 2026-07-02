import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET = 'uploads'

export async function uploadToStorage(
  file: Buffer | Uint8Array,
  filePath: string,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

export async function deleteFromStorage(filePath: string): Promise<void> {
  await supabaseAdmin.storage.from(BUCKET).remove([filePath])
}
