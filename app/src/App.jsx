import React from 'react';
import { Tree, RBTree } from './tree';
import * as d3 from 'd3';
import * as treedata from './data';

class BSTreeInsert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      answer: null,
    };
  }

  componentDidMount() {
    var datatree = treedata.getHierarchy(treedata.data10tree);
    var datains = treedata.data10ins.split(" ");
    let tree = new Tree("treeDiv", datatree, datains);
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
        <p>Consider the BST shown below. What is the tree that results after inserting the following sequence of keys:</p>
        <p>{treedata.data10ins}</p>
        <p>To insert a key into the tree, click on the empty node where you want it to be inserted.</p>
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
    var datatree = treedata.getHierarchy(treedata.data20tree);
    let tree = new Tree("treeDiv", datatree);
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
        <p>Suppose that you search for the key {treedata.data20key} in the BST shown below. What is the sequence of keys in the BST that are compared with 40 during the search miss?</p>
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
    var datatree = treedata.getHierarchy(treedata.data30);
    let tree = new RBTree("treeDiv", datatree);
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
        <p>Consider the left-leaning red-black BST shown below. Select the keys in the red nodes. A node is red if the link from its parent is red.</p>
        <p>To select a node, click on it. Click again to deselect. When you are done, click "Get Output".</p>
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
    var datatree = treedata.getHierarchy(treedata.data40tree);
    var datains = treedata.data40ins.split(" ");
    let tree = new RBTree("treeDiv", datatree, datains);
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
        <p>Consider the left-leaning red-black BST shown below. What is the resulting tree after inserting the following sequence of keys:</p>
        <p>{treedata.data40ins}</p>
        <p>To help you start, the red nodes are: {treedata.data40red}.</p>
        <p>To insert a key, click on the empty node where you want it to be. Click on non-empty nodes to toggle colors between red and black. To rotate, select a node and its parent. When you are done, click the "Get Output" button to generate your answer.</p>
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
