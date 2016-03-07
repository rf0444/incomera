import javax.servlet.ServletContext

import org.scalatra.LifeCycle

import jp.rf.incomera.SdpServlet

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new SdpServlet, "/sdps")
  }
}
