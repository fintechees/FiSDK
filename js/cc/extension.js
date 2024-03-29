var extension = {
  pathsMap: [],
  eaNames: [],
  indiNames: [],
  githubRepo: [],
  githubRes: [],
  getFile: async function (path) {
    try {
      var response = await fetch("https://raw.githubusercontent.com/fintechees/Expert-Advisor-Studio/master/" + path)
      return response.text()
    } catch (error) {
      throw new Error("Failed to fetch file from Github API.")
    }
  },
  getGithubList: async function () {
    var url = "https://api.github.com/repos/fintechees/Expert-Advisor-Studio/git/trees/master?recursive=1"

    try {
      // var response = await fetch(url, {
      //   headers: {
      //     Authorization: `token ` // public repo
      //   }
      // })
      var response = await fetch(url)
      var body = await response.json()
      return body.tree
    } catch (error) {
      throw new Error("Failed to fetch list from Github API.")
    }
  },
  genFilesTree: function (tree, dir, type, path, fullPath, sha) {
    var index = path.indexOf("/")
    if (index != -1) {
      var found = false
      var name = path.slice(0, index)
      var subTree = {name: name, objs: [], type: "dir"}
      for (var i in tree.objs) {
        if (tree.objs[i].name == name) {
          found = true
          subTree = tree.objs[i]
          break
        }
      }
      if (!found) {
        tree.objs.push(subTree)
      }
      this.genFilesTree(subTree, name, type, path.slice(index + 1), fullPath, sha)
    } else {
      var found = false
      var name = path
      var subTree = null
      if (type == "tree") {
        subTree = {name: name, objs: [], type: "dir"}
      } else {
        var nameArr = name.split(".")
        var extName = nameArr.length > 1 ? nameArr.pop() : "undefined"
        var pathArr = fullPath.split("/")
        var dirName = pathArr.length > 1 ? pathArr[pathArr.length - 2] : "root"
        subTree = {name: name, path: fullPath, extName: extName, dirName: dirName, type: "file", group: pathArr[0], sha: sha}
      }

      for (var i in tree.objs) {
        if (tree.objs[i].name == name) {
          found = true
          subTree = tree.objs[i]
          break
        }
      }
      if (!found) {
        tree.objs.push(subTree)
      }
    }
  },
  genFilesTable: async function (table, tree) {
    if (tree.type == "dir") {
      for (var i in tree.objs) {
        if (tree.objs[i].type == "dir") {
          await this.genFilesTable(table, tree.objs[i])
        }
      }

      var row = []
      row.push(tree.name)

      var group = ""
      var pngFiles = []
      var txtFiles = []
      var txtContents = []
      var jsFiles = []

      for (var i in tree.objs) {
        var obj = tree.objs[i]
        if (obj.type == "file") {
          if ((obj.group != "EA" && obj.group != "Indicators") || obj.dirName == "Built-in") {
            return
          }
          group = obj.group
          if (obj.extName == "png" || obj.extName == "jpg" || obj.extName == "jpeg") {
            pngFiles.push('<img class="thumbnail" src="https://raw.githubusercontent.com/fintechees/Expert-Advisor-Studio/master/' + obj.path + '" onclick="extension.showImage(event)">')
          }
          if (obj.extName == "txt") {
            txtFiles.push(obj.path)
          }
          if (obj.extName == "js") {
            var found = false
            var updateDT = 0
            if (obj.group == "EA") {
              for (var j in this.eaNames) {
                if (this.eaNames[j].name + ".js" == obj.name) {
                  found = true
                  updateDT = this.eaNames[j].updateDT
                  break
                }
              }
            }
            if (obj.group == "Indicators") {
              for (var j in this.indiNames) {
                if (this.indiNames[j].name + ".js" == obj.name) {
                  found = true
                  updateDT = this.indiNames[j].updateDT
                  break
                }
              }
            }
            if (found) {
              found = false
              for (var j in this.githubRepo) {
                if (this.githubRepo[j].path == obj.path) {
                  if (this.githubRepo[j].sha == obj.sha && typeof this.githubRepo[j].updateDT != "undefined" && this.githubRepo[j].updateDT < updateDT) {
                    found = true
                  }
                  break
                }
              }
              if (found) {
                jsFiles.push('<button type="button" class="ui tiny blue button button-with-spacing" onclick="extension.installExtension(event)" disabled>' + obj.name + ' installed</button>')
              } else {
                jsFiles.push('<button type="button" class="ui tiny blue button button-with-spacing" onclick="extension.installExtension(event)">Update ' + obj.name + '</button>')
              }
            } else {
              jsFiles.push('<button type="button" class="ui tiny blue button button-with-spacing" onclick="extension.installExtension(event)">Install ' + obj.name + '</button>')
            }
            this.pathsMap[obj.name] = obj.path
          }
        }
      }

      row.push(group)
      var pFiles = pngFiles.join("")
      row.push(pFiles)
      var txtContent = ""
      if (txtFiles.length > 0) {
        for (var i in txtFiles) {
          var txt = await this.getFile(txtFiles[i])
          var escapedStr = $("<div/>").text(txt).html()
          txtContents.push('<pre class="long-text my-pre">' + escapedStr + '</pre>')
        }
        txtContent = txtContents.join("<hr>")
        row.push(txtContent)
      } else {
        row.push("")
      }
      var jFiles = jsFiles.join("")
      row.push(jFiles)

      if (pFiles == "" && txtContent == "" && jFiles == "") {
      } else {
        table.push(row)
      }
    }
  },
  renderFilesTable: function (files) {
    var filesTable = null
    if ($.fn.dataTable.isDataTable("#filesList")) {
      filesTable = $("#filesList").DataTable()
      filesTable.clear().draw()
      filesTable.destroy()
      $("#filesList").empty()
    }

    filesTable = $("#filesList").DataTable({
      "responsive": true, "lengthChange": false, "autoWidth": false, "bFilter": false, "bInfo": false,
      "columns": [
        {
          "title": "Name",
          "render": function (data, type, row) {
            return '<strong>' + data + '</strong>'
          }
        },
        {"title": "Type"},
        {"title": "Picture"},
        {"title": "Description"},
        {"title": "Link"}
      ]
    })

    if (!window.fullScreenMode) {
      $("#filesList_wrapper .ui.grid").css("margin-top", "0px")
      $("#filesList_wrapper .ui.grid").css("margin-bottom", "0px")
      $("#filesList_wrapper .ui.grid").css("margin-left", "0px")
      $("#filesList_wrapper .ui.grid").css("margin-right", "0px")
    }

    for (var i in files) {
      filesTable.row.add(files[i]).draw(false)
    }

    $("#imgModal").on("click", function() {
      $(this).hide()
    })
  },
  showImage: function  (event) {
    var target = event.target || event.srcElement
    if (target.tagName === "IMG") {
      var imageUrl = target.getAttribute("src")
      $("#imgModal img").attr("src", imageUrl)
      $("#imgModal").show()
    }
  },
  installExtension: function (event) {
    var target = event.target || event.srcElement
    if (target.tagName === "BUTTON") {
      var name = target.textContent.split(" ")[1]
      if (typeof this.pathsMap[name] == "undefined") return
      var path = this.pathsMap[name]
      var that = this

      this.getFile(path)
        .then(function (res) {
          eval(res)
          target.textContent = path
          target.disabled = true

          var sha = ""
          for (var i in that.githubRes) {
            if (that.githubRes[i].path == path) {
              sha = that.githubRes[i].sha
              break
            }
          }

          var found = false
          for (var i in that.githubRepo) {
            if (that.githubRepo[i].path == path) {
              found = true
              that.githubRepo[i].sha = sha
              that.githubRepo[i].updateDT = Math.floor(new Date().getTime() / 1000)
              break
            }
          }
          if (!found) {
            that.githubRepo.push({
              path: path,
              sha: sha,
              updateDT: Math.floor(new Date().getTime() / 1000)
            })
          }
          localStorage.githubRepo = JSON.stringify(that.githubRepo)
        })
        .catch(function (err) {
          console.error(err.message)
        })
    }
  },
  init: function () {
    var that = this
    this.getGithubList()
      .then(function(res) {
        var eas = typeof localStorage.eas != "undefined" ? JSON.parse(localStorage.eas) : []
        var indicators = typeof localStorage.indicators != "undefined" ? JSON.parse(localStorage.indicators) : []
        for (var i in eas) {
          that.eaNames.push({
            name: eas[i].eaName,
            updateDT: (typeof eas[i].updateDT == "undefined" ? 0 : eas[i].updateDT)
          })
        }
        for (var i in indicators) {
          that.indiNames.push({
            name: indicators[i].indiName,
            updateDT: (typeof indicators[i].updateDT == "undefined" ? 0 : indicators[i].updateDT)
          })
        }
        that.githubRepo = typeof localStorage.githubRepo != "undefined" ? JSON.parse(localStorage.githubRepo) : []
        that.githubRes = res

        var filesTree = {name: "root", objs: [], type: "dir"}

        for (var i in res) {
          that.genFilesTree(filesTree, "root", res[i].type, res[i].path, res[i].path, res[i].sha)
        }

        var filesTable = []
        that.genFilesTable(filesTable, filesTree)
        .then(function (result) {
          that.renderFilesTable(filesTable)
        })
        .catch(function (err) {})
      })
      .catch(function(e) {
        console.error('Error:', e.message);
      })
  }
}
