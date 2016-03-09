package jp.rf.incomera

import java.util.concurrent.ConcurrentHashMap
import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json.JacksonJsonSupport
import org.scalatra.{NotFound, Ok, ScalatraServlet}
import scala.collection.JavaConverters._

class SdpServlet extends ScalatraServlet with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats
  val recorders = new ConcurrentHashMap[String, RecorderInfo]
  before() {
    contentType = formats("json")
  }
  get("/") {
    Ok(recorders.asScala.toSeq.map(_._2.recorder).sortBy(_.time))
  }
  post("/") {
    val sdp = request.body
    val time = System.currentTimeMillis
    val cid = time.toString
    val rs = RegisteredSdp(cid, sdp, time)
    recorders.put(cid, RecorderInfo(rs, Seq.empty))
    Ok(rs)
  }
  get("/:cid") {
    val cid = params("cid")
    Option(recorders.get(cid)) match {
      case Some(x) => Ok(x)
      case None => NotFound()
    }
  }
  post("/:cid") {
    val sdp = request.body
    val time = System.currentTimeMillis
    val wid = time.toString
    val rs = RegisteredSdp(wid, sdp, time)
    val cid = params("cid")
    val recorder = recorders.computeIfPresent(cid, new java.util.function.BiFunction[String, RecorderInfo, RecorderInfo] {
      def apply(k: String, v: RecorderInfo): RecorderInfo = {
        v.copy(watchers = v.watchers :+ rs)
      }
    })
    Option(recorder) match {
      case Some(_) => Ok(rs)
      case None => NotFound()
    }
  }
  delete("/:cid") {
    val cid = params("cid")
    recorders.remove(cid)
    Ok()
  }
  delete("/:cid/:wid") {
    val cid = params("cid")
    val wid = params("wid")
    recorders.computeIfPresent(cid, new java.util.function.BiFunction[String, RecorderInfo, RecorderInfo] {
      def apply(k: String, v: RecorderInfo): RecorderInfo = {
        v.copy(watchers = v.watchers.filter(_.id != wid))
      }
    })
    Ok()
  }
}

case class RecorderInfo(recorder: RegisteredSdp, watchers: Seq[RegisteredSdp])
case class RegisteredSdp(id: String, sdp: String, time: Long)
