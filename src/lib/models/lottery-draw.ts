import { ObjectId } from 'mongodb'

export interface LotteryDraw {
  _id?: ObjectId
  userEmail: string
  date: string
  numbers: number[]
  createdAt: Date
  updatedAt: Date
}

export interface LotteryDrawInput {
  date: string
  numbers: number[]
}
