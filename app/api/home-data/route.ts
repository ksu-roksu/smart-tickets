import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
export async function GET() {
  const events = await prisma.event.findMany({ where:{status:'PUBLISHED'}, include:{venue:true,ticketTypes:true}, orderBy:{date:'asc'}, take:9 })
  const totalSold = await prisma.ticket.count({ where:{status:'VALID'} })
  return NextResponse.json({ events, stats:{ totalSold, concert:events.filter(e=>e.category==='concert').length, theatre:events.filter(e=>e.category==='theatre').length, sport:events.filter(e=>e.category==='sport').length } })
}
