import { NextResponse } from 'next/server'

export async function GET() {
  const mockStudent = {
    Name: 'Demo Diák',
    Class: '12.A',
    DateOfBirth: '2006-08-23'
  }

  return NextResponse.json(mockStudent)
}