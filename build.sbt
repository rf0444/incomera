lazy val incomera = (project in file("."))
  .settings(org.scalatra.sbt.ScalatraPlugin.scalatraSettings)
  .settings(
    organization := "jp.rf",
    name := "incomera",
    version := "0.1.0",
    scalaVersion := "2.11.7",
    scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature"),
    resolvers += Classpaths.typesafeReleases,
    libraryDependencies ++= Seq(
      "org.scalatra" %% "scalatra" % "2.3.1",
      "org.scalatra" %% "scalatra-json" % "2.3.1",
      "org.json4s" %% "json4s-jackson" % "3.2.11",
      "javax.servlet" % "javax.servlet-api" % "3.1.0" % "provided",
      "org.eclipse.jetty" % "jetty-webapp" % "9.2.15.v20160210" % "container"
    ),
    ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }
  )
