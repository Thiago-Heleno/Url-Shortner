const app = new Vue({
  el: "#app",
  data: {
    url: "",
    slug: "",
    copied: null,
    created: "output",
    redirectUrl: null,
  },
  methods: {
    async createUrl() {
      const response = await fetch('/url', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          url: this.url,
          slug: this.slug
        })
      })
      this.created = await response.json();
      this.redirectUrl = "https://sh-everything.herokuapp.com/" + this.created.slug
    },
    copyToClipboard() {
      let testingCodeToCopy = document.querySelector('#testing-code')
      testingCodeToCopy.setAttribute('type', 'text')
      testingCodeToCopy.select()

      try {
        var successful = document.execCommand('copy');
        this.copied = "Copied to Clipboard"
      } catch (err) {
        alert('Oops, unable to copy');
      }

      /* unselect the range */
      window.getSelection().removeAllRanges()
    }
  }
})