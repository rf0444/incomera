package controllers

import akka.actor.{ActorRef, ActorSystem}
import akka.actor.ActorRef.noSender
import akka.pattern.ask
import akka.stream.Materializer
import akka.util.Timeout
import javax.inject.{Inject, Named, Singleton}
import play.api.mvc.{Action, Controller, WebSocket}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.JsValue
import play.api.libs.json.Json.toJson
import play.api.libs.streams.ActorFlow
import scala.concurrent.duration._

import model.Watch
import model.Watch.Implicits._

@Singleton
class Watches @Inject() (@Named("ws-actor") ws: ActorRef)(implicit implicitActorSystem: ActorSystem, implicitMaterializer: Materializer) extends Controller {
  implicit val timeout = Timeout(3.seconds)
  def list = Action.async {
    (ws ? 'listCamera).mapTo[Seq[Watch]].map { ws =>
      Ok(
        toJson(ws.sortBy(_.started))
      )
    }
  }
  def socket(id: String) = WebSocket.accept[JsValue, JsValue] { _ =>
    ActorFlow.actorRef(out => actors.WatchActor.props(id, ws, out))
  }
}
