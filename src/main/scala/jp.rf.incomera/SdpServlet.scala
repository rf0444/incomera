package jp.rf.incomera

import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json.JacksonJsonSupport
import org.scalatra.{NotFound, Ok, ScalatraServlet}
import scala.collection.concurrent.TrieMap

class SdpServlet extends ScalatraServlet with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats
  val sdps = TrieMap.empty[String, RegisteredSdp]
  before() {
    contentType = formats("json")
  }
  get("/") {
    Ok(sdps.toSeq.map(_._2).sortBy(_.time))
  }
  post("/") {
    val sdp = request.body
    val time = System.currentTimeMillis
    val cid = time.toString
    val rs = RegisteredSdp(cid, sdp, time)
    sdps += (cid -> rs)
    Ok(rs)
  }
  get("/:cid") {
    val cid = params("cid")
    sdps.get(cid) match {
      case Some(x) => Ok(x)
      case None => NotFound()
    }
  }
  delete("/:cid") {
    val cid = params("cid")
    // TODO: not atomic
    if (sdps.contains(cid)) {
      sdps -= cid
      Ok()
    } else {
      NotFound()
    }
  }
}

case class RegisteredSdp(id: String, sdp: String, time: Long)
