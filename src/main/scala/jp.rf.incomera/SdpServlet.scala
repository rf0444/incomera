package jp.rf.incomera

import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json.JacksonJsonSupport
import org.scalatra.{Ok, ScalatraServlet}

class SdpServlet extends ScalatraServlet with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats
  before() {
    contentType = formats("json")
  }
  get("/") {
    val now = System.currentTimeMillis
    val data = Seq(
      RegisteredSdp(now, "hello"),
      RegisteredSdp(now + 1000, "world")
    )
    Ok(data)
  }
}

case class RegisteredSdp(time: Long, text: String)
