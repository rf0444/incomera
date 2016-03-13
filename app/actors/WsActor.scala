package actors

import akka.actor.{Actor, ActorRef, Props}

object WsActor {
  case class Ws(data: Option[model.Watch], ref: ActorRef)
  def props = Props[WsActor]
}
class WsActor extends Actor {
  def behavior(ws: Map[String, WsActor.Ws]): Receive = {
    case 'listCamera => {
      sender() ! ws.values.flatMap(_.data).toSeq
    }
    case ('addCamera, id: String, time: Long, ref: ActorRef) => {
      val next = ws + (id -> WsActor.Ws(Some(model.Watch(id, time)), ref))
      context.become(behavior(next))
    }
    case ('addWatch, id: String, ref: ActorRef) => {
      val next = ws + (id -> WsActor.Ws(None, ref))
      context.become(behavior(next))
    }
    case ('remove, id: String) => {
      val next = ws - id
      context.become(behavior(next))
    }
    case ('getRef, id: String) => {
      sender() ! ws.get(id).map(_.ref)
    }
  }
  def receive: Receive = behavior(Map.empty)
}
