import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const carouselImages = await prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.error('Error fetching carousel images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch carousel images' },
      { status: 500 }
    )
  }
}
