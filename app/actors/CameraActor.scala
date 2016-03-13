package actors

import akka.actor.{Actor, ActorRef, Props}
import akka.pattern.ask
import akka.util.Timeout
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json
import scala.concurrent.duration._

object CameraActor {
  def props(ws: ActorRef, out: ActorRef) = Props(new CameraActor(ws, out))
}
class CameraActor(ws: ActorRef, out: ActorRef) extends Actor {
  implicit val timeout = Timeout(3.seconds)
  val time = System.currentTimeMillis
  val id = time.toString
  override def preStart(): Unit = {
    ws ! ('addCamera, id, time, self)
  }
  override def postStop(): Unit = {
    ws ! ('remove, id)
  }
  def receive = {
    case json.JsObject(v) => {
      v.get("to").foreach {
        case json.JsString(wid) =>
          (ws ? ('getRef, wid)).mapTo[Option[ActorRef]].foreach {
            case Some(ref) => ref ! ('send, json.JsObject(v + ("from" -> json.JsString(id))))
            case None =>
          }
        case _ =>
      }
    }
    case ('send, v: json.JsValue) => {
      out ! v
    }
  }
}
