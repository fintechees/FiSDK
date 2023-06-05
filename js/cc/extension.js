var extension = {
  eaNames: [],
  indicatorNames: [],
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
  genFilesTree: function (tree, dir, type, path, fullPath) {
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
      this.genFilesTree(subTree, name, type, path.slice(index + 1), fullPath)
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
        subTree = {name: name, path: fullPath, extName: extName, dirName: dirName, type: "file", group: pathArr[0]}
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
      var jsFiles = []

      for (var i in tree.objs) {
        var obj = tree.objs[i]
        if (obj.type == "file") {
          if (obj.group != "EA" && obj.group != "Indicators") {
            return
          }
          group = obj.group
          if (obj.extName == "png") {
            pngFiles.push('<img class="thumbnail" src="https://raw.githubusercontent.com/fintechees/Expert-Advisor-Studio/master/' + obj.path + '" onclick="extension.showImage(event)">')
          }
          if (obj.extName == "txt") {
            txtFiles.push(obj.path)
          }
          if (obj.extName == "js") {
            var found = false
            if (obj.group == "EA") {
              for (var j in this.eaNames) {
                if (this.eaNames[j] + ".js" == obj.name) {
                  found = true
                  break
                }
              }
            }
            if (obj.group == "Indicators") {
              for (var j in this.indiNames) {
                if (this.indiNames[j] + ".js" == obj.name) {
                  found = true
                  break
                }
              }
            }
            if (found) {
              jsFiles.push('<button type="button" class="ui tiny blue button button-with-spacing" onclick="extension.installExtension(event)" disabled>Install ' + obj.path + "</button>")
            } else {
              jsFiles.push('<button type="button" class="ui tiny blue button button-with-spacing" onclick="extension.installExtension(event)">Install ' + obj.path + "</button>")
            }
          }
        }
      }

      row.push(group)
      row.push(pngFiles.join(""))
      if (txtFiles.length > 0) {
        var txtContent = ""
        for (var i in txtFiles) {
          txtContent += await this.getFile(txtFiles[i])
          txtContent += "\n"
        }
        row.push(txtContent)
      } else {
        row.push("")
      }
      row.push(jsFiles.join(""))

      table.push(row)
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
        {
          "title": "Description",
          "render": function (data, type, row) {
            var escapedStr = $("<div/>").text(data).html()
            return '<pre class="long-text my-pre">' + escapedStr + '</pre>'
          }
        },
        {"title": "Link"}
      ],

    })

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
      var path = target.textContent.split(" ")[1]
      this.getFile(path)
        .then(function (res) {
          eval(res)
          target.textContent = path + " installed"
          target.disabled = true
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
        var filesTree = {name: "root", objs: [], type: "dir"}

        for (var i in res) {
          that.genFilesTree(filesTree, "root", res[i].type, res[i].path, res[i].path)
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

    var eas = JSON.parse(localStorage.eas)
    var indicators = JSON.parse(localStorage.indicators)
    for (var i in eas) {
      this.eaNames.push(eas[i].eaName)
    }
    for (var i in indicators) {
      this.indiNames.push(indicators[i].indiName)
    }
  }
}
