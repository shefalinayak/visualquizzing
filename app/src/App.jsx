import React from 'react';
import { Tree, RBTree } from './tree';
import * as d3 from 'd3';

var treeData1 = {
  name: "62",
  children: [
    {
      name: "35",
      children: [
        {
          name: "28",
          children: [
            {
              name: "16",
              children: [{}, {}]
            },
            {
              name: "32",
              children: [{}, {}]
            }
          ]
        },
        {
          name: "40",
          children: [
            {
              name: "51",
              children: [{}, {}]
            },
            {}
          ]
        }
      ]
    },
    {
      name: "78",
      children: [
        {
          name: "65",
          children: [{}, {}]
        },
        {
          name: "93",
          children: [{}, {}]
        }
      ]
    }
  ]
};

class BSTreeInsert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      answer: null,
    };
  }

  componentDidMount() {
    let tree = new Tree("treeDiv", treeData1, ["60"]);
    this.state.tree = tree;
    d3.select("#menu")
    .append("button")
    .text("Submit")
    .on("click", function() {
      var ans = document.getElementById("answer");
      ans.setAttribute("value", tree.getLevelOrder());
    });
    d3.select("#result")
    .insert("input")
    .attr("type", "text")
    .attr("id", "answer")
    .style("width", "100%");
  }

  render() {
    return (
      <div id="question">
        <h2>BST Insertion</h2>
        <p>Insert the key "60" into the Binary Search Tree shown below.</p>
        <p></p>
        <div id="treeDiv"></div>
        <div id="error"></div>
        <div id="menu"></div>
        <div id="result"></div>
      </div>
    );
  }
}

class BSTreeSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      answer: null,
    };
  }

  componentDidMount() {
    let tree = new Tree("treeDiv", treeData1);
    this.state.tree = tree;
    d3.select("#menu")
    .append("button")
    .text("Submit")
    .on("click", function() {
      var ans = document.getElementById("answer");
      ans.setAttribute("value", tree.getSelected());
    });
    d3.select("#result")
    .insert("input")
    .attr("type", "text")
    .attr("id", "answer")
    .style("width", "100%");
  }

  render() {
    return (
      <div id="question">
        <h2>BST Search</h2>
        <p>Select the nodes that would be compared with "49" in a search miss.</p>
        <p></p>
        <div id="treeDiv"></div>
        <div id="error"></div>
        <div id="menu"></div>
        <div id="result"></div>
      </div>
    );
  }
}

class RBTreeColor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      answer: null,
    };
  }

  componentDidMount() {
    let tree = new RBTree("treeDiv", treeData1);
    this.state.tree = tree;
    d3.select("#menu")
    .append("button")
    .text("Get Output")
    .on("click", function() {
      var ans = document.getElementById("answer");
      ans.setAttribute("value", tree.getSelected());
    });
    d3.select("#result")
    .insert("input")
    .attr("type", "text")
    .attr("id", "answer")
    .style("width", "100%");
  }

  render() {
    return (
      <div id="question">
        <h2>Red Black BST Coloring</h2>
        <p>Consider the left-leaning Red-Black BST shown below. Select the red nodes. A node is red if the link from its parent is red.</p>
        <p></p>
        <div id="treeDiv"></div>
        <div id="error"></div>
        <div id="menu"></div>
        <div id="result"></div>
      </div>
    );
  }
}

class RBTreeInsert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      answer: null,
    };
  }

  componentDidMount() {
    let tree = new RBTree("treeDiv", treeData1, ["60"]);
    this.state.tree = tree;

    d3.select("#menu")
    .append("button")
    .text("Rotate")
    .on("click", tree.rotate);

    d3.select("#menu")
    .append("button")
    .text("Get Output")
    .on("click", function() {
      var ans = document.getElementById("answer");
      ans.setAttribute("value", tree.getLevelOrder());
    });

    d3.select("#result")
    .insert("input")
    .attr("type", "text")
    .attr("id", "answer")
    .style("width", "100%");

    var colorB = d3.select("#color")
    .style("color", "black")
    .style("background-color", "#f55");
    var rotateB = d3.select("#rotate")
    .style("color", "#aaa")
    .style("background-color", "#ccc");

    colorB.on("click", function() {
      tree.onRotate = false;
      rotateB.style("color", "#aaa").style("background-color", "#ccc");
      colorB.style("color", "black").style("background-color", "#f55");
    });

    rotateB.on("click", function() {
      tree.onRotate = true;
      colorB.style("color", "#aaa").style("background-color", "#ccc");
      rotateB.style("color", "black").style("background-color", "turquoise");
    });
  }

  render() {
    return (
      <div id="question">
        <h2>Red Black BST Insertion</h2>
        <p>Insert the following nodes into the Red-Black BST shown below.</p>
        <p></p>
        <div id="treeDiv"></div>
        <div id="error"></div>
        <div id="menu">
          <button id="color">Color Red/Black</button>
          <button id="rotate">Select for Rotation</button>
        </div>
        <div id="result"></div>
      </div>
    );
  }
}

export {
  BSTreeInsert,
  BSTreeSearch,
  RBTreeColor,
  RBTreeInsert
};
