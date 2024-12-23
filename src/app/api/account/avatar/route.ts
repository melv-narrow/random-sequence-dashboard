import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth.config'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { cwd } from 'process'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = join(cwd(), 'public', 'uploads')
    await writeFile(join(uploadDir, `avatar-${session.user.id}${getFileExtension(file.name)}`), buffer)

    // Update user's image URL in the database
    const imageUrl = `/uploads/avatar-${session.user.id}${getFileExtension(file.name)}`
    
    // Update the user's profile in the database with the new image URL
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/account/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUrl })
    })

    if (!res.ok) {
      throw new Error('Failed to update profile')
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()
  return ext ? `.${ext}` : ''
}
