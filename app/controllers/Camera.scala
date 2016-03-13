package controllers

import akka.actor.{ActorRef, ActorSystem}
import akka.stream.Materializer
import javax.inject.{Inject, Named, Singleton}
import play.api.mvc.{Action, Controller, WebSocket}
import play.api.libs.json.JsValue
import play.api.libs.streams.ActorFlow

@Singleton
class Camera @Inject() (@Named("ws-actor") ws: ActorRef)(implicit implicitActorSystem: ActorSystem, implicitMaterializer: Materializer) extends Controller {
  def socket = WebSocket.accept[JsValue, JsValue] { _ =>
    ActorFlow.actorRef(out => actors.CameraActor.props(ws, out))
  }
}
