import { Parser } from "../../src/markdown/parser";
import { HTMLRender } from "../../src/markdown/renderer";

function BlockQuote_Testcase1() {
  console.log("BlockQuote Testcase 1: Start...")
  let input = "> abc\n----";
  let expectation = `<blockquote>
<p>abc</p>
</blockquote>
<hr/>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 1: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 1: Fail");
  }
}

function BlockQuote_Testcase2() {
  console.log("BlockQuote Testcase 2: Start...")
  let input = "> abc\ndef";
  let expectation = `<blockquote>
<p>abc
def</p>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 2: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 2: Fail");
  }
}

function BlockQuote_Testcase3() {
  console.log("BlockQuote Testcase 3: Start...")
  let input = "> abc\n> ===";
  let expectation = `<blockquote>
<h1>abc</h1>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 3: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 3: Fail");
  }
}

function BlockQuote_Testcase4() {
  console.log("BlockQuote Testcase 4: Start...")
  let input = "> abc\n> ---";
  let expectation = `<blockquote>
<h2>abc</h2>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 4: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 4: Fail");
  }
}

function BlockQuote_Testcase5() {
  console.log("BlockQuote Testcase 5: Start...")
  let input = ">      abc\n>      def";
  let expectation = `<blockquote>
<pre><code> abc
 def</code></pre>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 5: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 5: Fail");
  }
}

function BlockQuote_Testcase6() {
  console.log("BlockQuote Testcase 6: Start...")
  let input = "> ```\n> abc\n> ```";
  let expectation = `<blockquote>
<pre><code>abc
</code></pre>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 6: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 6: Fail");
  }
}

function BlockQuote_Testcase7() {
  console.log("BlockQuote Testcase 7: Start...")
  let input = "> ```\n> abc\n```";
  let expectation = `<blockquote>
<pre><code>abc
</code></pre>
</blockquote>
<pre><code></code></pre>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 7: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 7: Fail");
  }
}

function BlockQuote_Testcase8() {
  console.log("BlockQuote Testcase 8: Start...")
  let input = `>      abc
>      def`;
  let expectation = `<blockquote>
<pre><code> abc
 def</code></pre>
</blockquote>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 8: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 8: Fail");
  }
}

function BlockQuote_Testcase9() {
  console.log("BlockQuote Testcase 9: Start...")
  let input = `>     abc
>     edf
     ghi`;
  let expectation = `<blockquote>
<pre><code>abc
edf
</code></pre>
</blockquote>
<pre><code> ghi</code></pre>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("BlockQuote Testcase 9: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("BlockQuote Testcase 9: Fail");
  }
}


export function BlockQuote_Testcases() {
  BlockQuote_Testcase1();
  BlockQuote_Testcase2();
  BlockQuote_Testcase3();
  BlockQuote_Testcase4();
  BlockQuote_Testcase5();
  BlockQuote_Testcase6();
  BlockQuote_Testcase7();
  BlockQuote_Testcase8();
  BlockQuote_Testcase9();
}