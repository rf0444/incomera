lazy val incomera = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    organization := "jp.rf",
    name := "incomera",
    version := "0.1.0",
    scalaVersion := "2.11.7",
    scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature"),
    libraryDependencies ++= Seq(
      ws
    ),
    ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }
  )
