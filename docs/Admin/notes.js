import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { app, adminList } from "../app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

!(function () {
  "use strict";

  // Function to save content to local storage
  async function saveContent() {
    const editorContent = document.querySelector(".editor").innerHTML;
    localStorage.setItem("editorContent", editorContent);

    const reference = ref(db, "seminarkurs/");

    await set(reference, {
      editorContent,
    });
  }

  // Function to load content from local storage
  function loadContent() {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      document.querySelector(".editor").innerHTML = savedContent;
    } else {
      const reference = ref(db, "seminarkurs/");

      get(reference).then((snapshot) => {
        if (snapshot.exists()) {
          document.querySelector(".editor").innerHTML =
            snapshot.val().editorContent;
        }
      });
    }
  }

  // Initialize editor with the toolbar
  function initializeEditor() {
    var editors = document.querySelectorAll("[data-tiny-editor]");
    editors.forEach(function (editor) {
      editor.setAttribute("contentEditable", true);
      editor.classList.add("__editor");

      var toolbar = createToolbar(editor);
      editor.insertAdjacentElement("beforebegin", toolbar);

      // Load saved content if available
      loadContent();

      // Save content on changes
      editor.addEventListener("input", saveContent);

      var updateToolbarState = function () {
        // Update toolbar state based on current selection and commands
        updateSelectOptions(toolbar);
        updateButtonStates(toolbar);
      };

      editor.addEventListener("keydown", updateToolbarState);
      editor.addEventListener("keyup", updateToolbarState);
      editor.addEventListener("click", updateToolbarState);
      toolbar.addEventListener("click", updateToolbarState);
    });
  }

  // Create the toolbar
  function createToolbar(editor) {
    var toolbar = document.createElement("div");
    toolbar.className = "__toolbar";

    // Add dropdowns for formatting
    toolbar.appendChild(
      createDropdown("formatBlock", "Paragraph", {
        Paragraph: "p",
        "Heading 1": "h1",
        "Heading 2": "h2",
        "Heading 3": "h3",
        "Heading 4": "h4",
        "Heading 5": "h5",
        "Heading 6": "h6",
      })
    );
    toolbar.appendChild(
      createDropdown("fontName", "Serif", {
        Serif: "serif",
        "Sans-Serif": "sans-serif",
        Monospace: "monospace",
        Cursive: "cursive",
        Fantasy: "fantasy",
      })
    );

    // Add buttons to the toolbar
    toolbar.appendChild(
      createButton("bold", "Bold", "fa fa-bold", function () {
        document.execCommand("bold");
      })
    );
    toolbar.appendChild(
      createButton("italic", "Italic", "fa fa-italic", function () {
        document.execCommand("italic");
      })
    );
    toolbar.appendChild(
      createButton("underline", "Underline", "fa fa-underline", function () {
        document.execCommand("underline");
      })
    );
    toolbar.appendChild(createColorPicker("forecolor", "Text color", "color"));

    // Add alignment buttons
    toolbar.appendChild(
      createButton(
        "justifyleft",
        "Left align",
        "fa fa-align-left",
        function () {
          document.execCommand("justifyleft");
        }
      )
    );
    toolbar.appendChild(
      createButton(
        "justifycenter",
        "Center align",
        "fa fa-align-center",
        function () {
          document.execCommand("justifycenter");
        }
      )
    );
    toolbar.appendChild(
      createButton(
        "justifyright",
        "Right align",
        "fa fa-align-right",
        function () {
          document.execCommand("justifyright");
        }
      )
    );
    toolbar.appendChild(
      createButton(
        "justifyfull",
        "Justify",
        "fa fa-align-justify",
        function () {
          document.execCommand("justifyfull");
        }
      )
    );

    // Add list buttons
    toolbar.appendChild(
      createButton(
        "insertorderedlist",
        "Numbered list",
        "fa fa-list-ol",
        function () {
          document.execCommand("insertorderedlist");
        }
      )
    );
    toolbar.appendChild(
      createButton(
        "insertunorderedlist",
        "Bulleted list",
        "fa fa-list-ul",
        function () {
          document.execCommand("insertunorderedlist");
        }
      )
    );

    // Add clear formatting button
    toolbar.appendChild(
      createButton(
        "removeFormat",
        "Clear formatting",
        "fa fa-eraser",
        function () {
          document.execCommand("removeFormat");
        }
      )
    );

    return toolbar;
  }

  function createDropdown(command, title, options) {
    var select = document.createElement("select");
    select.className = "__toolbar-item";
    select.title = title;
    select.dataset.commandId = command;

    Object.keys(options).forEach(function (key) {
      var option = document.createElement("option");
      option.value = options[key];
      option.textContent = key;
      select.appendChild(option);
    });

    select.addEventListener("change", function (e) {
      var value = e.target.value;
      document.execCommand(command, false, value);
    });

    return select;
  }

  function createButton(command, title, iconClass, action) {
    var button = document.createElement("button");
    button.dataset.commandId = command;
    button.className = "__toolbar-item button-styles";
    button.title = title;
    button.type = "button";

    var icon = document.createElement("i");
    icon.className = iconClass;
    button.appendChild(icon);

    button.addEventListener("click", action);
    return button;
  }

  function createColorPicker(command, title, type) {
    var input = document.createElement("input");
    input.dataset.commandId = command;
    input.className = "__toolbar-item";
    input.title = title;
    input.type = type;
    input.addEventListener("change", function (e) {
      document.execCommand(command, false, e.target.value);
    });
    return input;
  }

  function createSeparator() {
    var separator = document.createElement("span");
    separator.className = "__toolbar-separator";
    return separator;
  }

  function updateSelectOptions(toolbar) {
    // Update select options in the toolbar based on current selection
    var selects = toolbar.querySelectorAll("select[data-command-id]");
    selects.forEach(function (select) {
      var command = select.dataset.commandId;
      var value = document.queryCommandValue(command);
      var option = Array.from(select.options).find(function (opt) {
        return opt.value === value;
      });
      select.selectedIndex = option ? option.index : -1;
    });
  }

  function updateButtonStates(toolbar) {
    // Update button states in the toolbar based on current selection
    var buttons = toolbar.querySelectorAll("button[data-command-id]");
    buttons.forEach(function (button) {
      var command = button.dataset.commandId;
      var state = document.queryCommandState(command);
      button.classList.toggle("active", state);
    });
  }

  // Call the initializeEditor function when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initializeEditor);
})();
