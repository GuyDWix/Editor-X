var mode = "sort"
var grid = false
var contrastTolarance = 120

$(function () {
  init()
});

function init() {
  initSpacers()
  initUIClicks()
  initSortable()
  initResizable()
  initOutlayoutStyling()
  UITouchUp()
}

function initUIClicks() {
  $('.align-bar-button').click(alignBtns)

  $('.toggle').click(toggleMode)
  $('.toggle_grid')
    .click(toggleGrid)
    .attr('disabled', 'true')

  $('.layout-thumb').click(function () {
    $('.align-bar').addClass('collapsed-bottom')
    $('.recommended-layouts').addClass('collapsed-left')
    setTimeout(() => {
      applyLayout($(this).attr('data-layout'))
    }, 300);
  })
}


function initOutlayoutStyling() {
  $(".draggable-outline")
    .on("mouseover", function () {
      $(this)
        .addClass("move-cursor")

      if ($(this).hasClass('draggable-outline')) {
        $(this).addClass("show-outlines")
      }
    })

    .on("mouseout", function () {
      $(this).removeClass("show-outlines")
    })

    .on("mousedown", function () {
      $(this)
        .removeClass("move-cursor")
        .addClass("grab-cursor")
    })

    .on("mouseup", function () {
      $(this)
        .removeClass("grab-cursor")
        .addClass("move-cursor")
    });
}

function alignBtns() {
  let $currentClickedBtn = $(this)
  let alignMode = $currentClickedBtn.attr('data-align')
  let alignFlexMode = ""

  $('.align-bar-button').removeClass('selected')
  $currentClickedBtn.addClass('selected')

  switch (alignMode) {
    case "left":
      alignFlexMode = "flex-start"
      break;
    case "center":
      alignFlexMode = "center"
      break;
    case "right":
      alignFlexMode = "flex-end"
      break;
  }

  $('.section_layout_flex_wrapper').css({
    alignItems: alignFlexMode,
    textAlign: alignMode
  })

}

function toggleMode() {
  if (mode === "sort") {
    $(".sortable").sortable("destroy")
    $('.toggle_grid').removeAttr('disabled')
    $('.toggle').text('free move')

    initDraggable()
    mode = "drag"

  } else {
    $(".draggable").draggable("destroy")
    $('.toggle_grid').attr('disabled', 'true')
    $('.toggle').text('smart layout')

    initSortable()
    mode = "sort"

  }

}

function toggleGrid() {
  if (mode === "drag") {
    grid = !grid;
    $(".draggable").draggable("destroy")
    initDraggable()

    $('.toggle_grid')
      .text(`grid is ${grid? "on": "off"}`)
      .removeClass("on")
      .addClass(`${grid? "on": ""}`)
  }
}

function initSortable() {
  $(".section_canvas").sortable({
    tolerance: "pointer",
    items: '.section_layout'
  });

  $('.section_item_img').sortable({
    tolerance: "pointer",
    items: '.section_layout',
    receive: function (event, ui) {
      adjustTextContrast($(ui.item))
    },
  });

  $(".section_layout").sortable({
      tolerance: "pointer",
      connectWith: ".section_layout, .section_item_img",
      items: '.section_item_wrapper',
      receive: function (event, ui) {
        if ($(ui.sender).find('.section_item').length == 0 && $(ui.sender).hasClass('section_column')) {
            $(".section_canvas").width($(".section_canvas").width())
            $(ui.sender).remove()
            $('.section_column').width('100%')
            $('.section_column').css('flex-basis', '100%')

            $('.collapsed').removeClass(function (index, className) {
              return (className.match(/(^|\s)collapsed\S+/g) || []).join(' ')
            });
        } else if ($('.section_item_img').find('.section_item').length == 0) {
          $('.section_item_img').removeClass('overlay-white overlay-black')
        }
        $(ui.item).css('z-index', 'initial')
      },
      out: function (event, ui) {
        ui.sender.minWidth = ui.sender.minWidth
        $('.section_layout').removeClass('show-outlines')
      },
      stop: function () {
        $('.resizer').removeClass('hide')
      },
      activate: function (event, ui) {
        $(ui.item).css('z-index', '999999999999')
        $('.resizer').addClass('hide')
      },
      over: function (event, ui) {
        let $targetSection = $(event.target)
        let $originalSection = $(ui.sender)

        if ($targetSection != $originalSection) {
          $targetSection.addClass('show-outlines')
        }
      }
    })
    .addClass('draggable-outline')
}

function adjustTextContrast(el) {
  var parentImg = el.closest('.section_item_img')[0]
  var rgb = getAverageRGB(parentImg)
  var overlay = ""

  var o = Math.round(((parseInt(rgb.r) * 299) +
    (parseInt(rgb.b) * 587) +
    (parseInt(rgb.g) * 114)) / 1000)
  var fore = (o > contrastTolarance) ? 'black' : 'white'

  if (o > contrastTolarance && contrastTolarance < 220) {
    overlay = 'overlay-white'
  } else if (o < contrastTolarance && contrastTolarance > 20) {
    overlay = 'overlay-black'
  }

  el.css('color', fore)
  $(parentImg).addClass(overlay)
}

function getAverageRGB(img, default_color = '#000') {

  if (img.currentStyle) {
    var img_url = img.currentStyle['background-image']
  } else if (window.getComputedStyle) {
    var img_url = document.defaultView.getComputedStyle(img, null).getPropertyValue('background-image');
  } else {
    return default_color
  }
  img_url = img_url.substr(5, img_url.length - 7)

  img = document.createElement('img')
  img.src = img_url
  img.id = 'dominantColourImg'
  img.style.display = 'none'

  var blockSize = 5,
    canvas = document.createElement('canvas'),
    context = canvas.getContext && canvas.getContext('2d'),
    data, width, height,
    i = -4,
    length,
    rgb = {
      r: 0,
      g: 0,
      b: 0
    },
    count = 0;

  if (!context) {
    return default_color
  }

  height = canvas.height = img.naturalHeight || img.offsetHeight || img.height
  width = canvas.width = img.naturalWidth || img.offsetWidth || img.width

  context.drawImage(img, 0, 0)

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    return default_color
  }

  length = data.data.length

  while ((i += blockSize * 4) < length) {
    ++count
    rgb.r += data.data[i]
    rgb.g += data.data[i + 1]
    rgb.b += data.data[i + 2]
  }

  rgb.r = ~~(rgb.r / count)
  rgb.g = ~~(rgb.g / count)
  rgb.b = ~~(rgb.b / count)

  $(canvas).remove()

  return rgb
}


function initDraggable() {
  grid_size = grid ? 20 : 1

  $('.section_layout').removeClass('draggable-outline')

  $(".draggable").draggable({
    grid: [grid_size, grid_size],
    containment: ".section_canvas"
  })
}

function createRisizes() {
  const elements = $('.resizable-box')
  const resizeTemplate = `
  <div class="resizes_wrapper">
    <div class='resizers'>
      <div class='resizer top'></div>
      <div class='resizer right'></div>
      <div class='resizer bottom'></div>
      <div class='resizer left'></div>
      <!-->
      <div class='resizer top-left'></div>
      <div class='resizer top-right'></div>
      <div class='resizer bottom-left'></div>
      <div class='resizer bottom-right'></div>
    </div>
  </div>
`
  elements.each(function () {
    $(this).append(resizeTemplate)
  })
}

function createSpacers() {
  const elements = $('.spacer-item')
  let spacerTemplate = ``

  elements.each(function () {
    if ($(this).hasClass('spacer-invert')) {
      spacerTemplate = `
            <div class="spacers_wrapper section_item_wrapper">
            ${$(this)[0].outerHTML}
                <div class='spacer top'>
                  <div class="spacer-handle top"></div>
                </div>
            </div>
          `

      $sectionParent = $(this).parent()

      $sectionParent.append(spacerTemplate)
      $(this).detach()
    } else if ($(this).hasClass('spacer-inner')) {
      const spacerTemplate = `
            <div class="inner_spacers_wrapper">
                <div class='inner-spacer top'>
                  <div class="spacer-handle top"></div>
                </div>
            </div>
          `

      $(this).append(spacerTemplate)
    }
  })
}

function initResizable() {
  createRisizes()
  const resizers = document.querySelectorAll('.resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  for (let i = 0; i < resizers.length; i++) {
    const currentResizer = resizers[i];
    const element = currentResizer.closest('.resizable-box');

    currentResizer.addEventListener('mousedown', function (e) {
      e.preventDefault()
      e.stopPropagation()

      destroyDraggableOrSortable()

      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)

    })

    function resize(e) {

      if (currentResizer.classList.contains('top')) {
        let height = original_height - (e.pageY - original_mouse_y)

        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }

      } else if (currentResizer.classList.contains('bottom')) {
        let height = original_height + (e.pageY - original_mouse_y)

        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }
      } else if (currentResizer.classList.contains('right')) {
        let width = original_width + (e.pageX - original_mouse_x)

        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }
      } else if (currentResizer.classList.contains('left')) {
        let width = original_width - (e.pageX - original_mouse_x)

        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }

      } else if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }
        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }
      } else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }
        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }
      } else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }
        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }
      } else if (currentResizer.classList.contains('top-left')) {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.minWidth = width + 'px'
        }
        if (height > minimum_size) {
          element.style.minHeight = height + 'px'
        }
      }

      const sectionCanvasWidth = $('.section_canvas').outerWidth()
      let totalW = 0
      $('.section_column').each(function () {
        totalW += $(this).outerWidth()
      })

      if (totalW > sectionCanvasWidth) {
        let WMOD = totalW % sectionCanvasWidth
        element.style.minWidth = (original_width - WMOD) + 'px'
        return false
      }

    }

    function stopResize() {
      restartDraggableOrSortable()
      window.removeEventListener('mousemove', resize)
    }
  }

}

function initSpacers() {
  createSpacers()
  const spacers = document.querySelectorAll('.spacer-handle')
  const minimum_size = 0;
  let original_width = 0;
  let original_height = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  for (let i = 0; i < spacers.length; i++) {
    const currentSpacer = spacers[i];
    const element = currentSpacer.closest('.spacer');

    currentSpacer.addEventListener('mousedown', function (e) {
      e.preventDefault()
      e.stopPropagation()

      destroyDraggableOrSortable()

      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', onSpaceResize)
      window.addEventListener('mouseup', onSpaceResizeStop)

    })

    function onSpaceResize(e) {
      $(currentSpacer).parent().addClass('show')
      resize(e)
    }

    function onSpaceResizeStop(e) {
      $(currentSpacer).parent().removeClass('show')
      stopResize()
    }

    function resize(e) {
      const sectionCanvasWidth = $('.section_canvas').outerWidth()
      let totalW = 0
      $('.section_column').each(function () {
        totalW += $(this).outerWidth()
      })

      if (totalW > sectionCanvasWidth) {
        let WMOD = totalW % sectionCanvasWidth
        element.style.minWidth = (original_width - WMOD) + 'px'
        e.stopPropagation()
        e.preventDefault()
        return false
      }

      if (currentSpacer.classList.contains('top')) {
        let height = original_height - (e.pageY - original_mouse_y)

        if ($(currentSpacer).parent().parent().find('.spacer-invert').length > 0) {
          height = original_height + (e.pageY - original_mouse_y)
        }

        if (height > minimum_size) {
          height -= 2
          element.style.height = height + 'px'
        }

      } else if (currentSpacer.classList.contains('bottom')) {
        let height = original_height + (e.pageY - original_mouse_y)

        if ($(currentSpacer).parent().parent().find('.spacer-invert').length > 0) {
          height = original_height - (e.pageY - original_mouse_y)
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }


      } else if (currentSpacer.classList.contains('right')) {
        let width = original_width + (e.pageX - original_mouse_x)

        if ($(currentSpacer).parent().parent().find('.spacer-invert').length > 0) {
          width = original_width - (e.pageX - original_mouse_x)
        }

        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentSpacer.classList.contains('left')) {
        let width = original_width - (e.pageX - original_mouse_x)

        if ($(currentSpacer).parent().parent().find('.spacer-invert').length > 0) {
          width -= 2
          width = original_width + (e.pageX - original_mouse_x)
        }

        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      }

      $(currentSpacer).css('opacity', '1')


    }

    function stopResize() {
      restartDraggableOrSortable()
      window.removeEventListener('mousemove', onSpaceResize)
    }
  }

}

function destroyDraggableOrSortable() {
  if (mode == "sort") {
    $(".sortable").sortable("destroy")
  } else {
    $('.draggable').draggable('destroy')
  }
}

function restartDraggableOrSortable() {
  if (mode == "sort") {
    initSortable()
  } else {
    initDraggable()
  }
}

function applyLayout(layoutNum) {
  let num = +layoutNum;
  destroyDraggableOrSortable()

  if (num == 1) {

    const $sectionLayout = $('.section_column')
    const $sectionImg = $('.section_item_img')
    const $sectionHeading = $sectionLayout.find('.heading').closest('section_item')
    const $sectionText = $sectionLayout.find('.text').closest('section_item')
    const $sectionButton = $sectionLayout.find('.button').closest('section_item')

    $sectionButton.detach().prependTo($sectionLayout)
    $sectionText.detach().prependTo($sectionLayout)
    $sectionHeading.detach().prependTo($sectionLayout)
    $sectionImg.detach().prependTo($sectionLayout)

    let sectionNewW = $sectionLayout.width() + 80
    let sectionNewH = $sectionLayout.height() + 40

    $sectionLayout
      .width(sectionNewW)
      .height(sectionNewH)
      .css("padding", "0 0 40px 0")
      .addClass('justify-between')
      .removeClass('justify-center')

    $sectionImg.css({
      width: 'calc(100% - 20px)',
      backgroundPosition: "bottom",
      marginBottom: "20px"
    })
  }

  $('.align-bar-button[data-align="center"]').click()

  restartDraggableOrSortable()
}

function UITouchUp() {
  $('.section_item_img + .spacer.top').height(2)
}