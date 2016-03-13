package model

import play.api.libs.json.Json

case class Watch(id: String, started: Long)

object Watch {
  object Implicits {
    implicit val implicitJsonFormat = Json.format[Watch]
  }
}
