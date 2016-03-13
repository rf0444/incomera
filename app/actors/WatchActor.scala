package actors

import akka.actor.{Actor, ActorRef, Props}
import akka.pattern.ask
import akka.util.Timeout
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json
import scala.concurrent.duration._

object WatchActor {
  def props(cid: String, ws: ActorRef, out: ActorRef) = Props(new WatchActor(cid, ws, out))
}
class WatchActor(cid: String, ws: ActorRef, out: ActorRef) extends Actor {
  implicit val timeout = Timeout(3.seconds)
  val time = System.currentTimeMillis
  val wid = time.toString
  override def preStart(): Unit = {
    ws ! ('addWatch, wid, self)
  }
  override def postStop(): Unit = {
    ws ! ('remove, wid)
  }
  def receive = {
    case json.JsObject(v) => {
      (ws ? ('getRef, cid)).mapTo[Option[ActorRef]].foreach {
        case Some(ref) => ref ! ('send, json.JsObject(v + ("from" -> json.JsString(wid)) + ("to" -> json.JsString(cid))))
        case None =>
      }
    }
    case ('send, v: json.JsValue) => {
      out ! v
    }
  }
}
