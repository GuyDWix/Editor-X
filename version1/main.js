var mode = "sort"
var grid = false


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
        .removeClass("opac")
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

  $(".section_layout").sortable({
      tolerance: "pointer",
      connectWith: ".section_layout",
      items: '.section_item_wrapper',
      receive: function (event, ui) {
        if ($(ui.sender).find('.section_item').length == 0) {
          $(".section_canvas").width($(".section_canvas").width())
          $(ui.sender).remove()
          $('.section_layout').width('100%')

          $('.collapsed').removeClass(function (index, className) {
            return (className.match(/(^|\s)collapsed\S+/g) || []).join(' ');
          });

        } else {
          $('.section_layout').width('initial')
        }
        $(ui.item).css('z-index', 'initial')
      },
      out: function (event, ui) {
        $(ui.sender).width($(ui.sender).width())
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

function initDraggable() {
  grid_size = grid ? 20 : 1;

  $('.section_layout').removeClass('draggable-outline')

  $(".draggable").draggable({
    grid: [grid_size, grid_size],
    containment: ".section_canvas"
  });
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
  let original_x = 0;
  let original_y = 0;
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
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)

    })

    function resize(e) {

      if (currentResizer.classList.contains('top')) {
        let height = original_height - (e.pageY - original_mouse_y)

        if (currentResizer.classList.contains('spacer-handle')) {
          height = original_height + (e.pageY - original_mouse_y)
        } else {
          if (height < minimum_size) {
            return false
          }
        }

        element.style.height = height + 'px'

      } else if (currentResizer.classList.contains('bottom')) {
        let height = original_height + (e.pageY - original_mouse_y)

        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('right')) {
        let width = original_width + (e.pageX - original_mouse_x)

        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentResizer.classList.contains('left')) {
        let width = original_width - (e.pageX - original_mouse_x)

        if (currentResizer.classList.contains('spacer-handle')) {
          width = original_width + (e.pageX - original_mouse_x)
        } else {
          if (width < minimum_size) {
            return false
          }
        }

        element.style.width = width + 'px'

      } else if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
      } else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      } else if (currentResizer.classList.contains('top-left')) {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
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
  let original_x = 0;
  let original_y = 0;
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
      original_x = element.getBoundingClientRect().left;
      original_y = element.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      window.addEventListener('mousemove', onSpaceResize)
      window.addEventListener('mouseup', onSpaceResizeStop)

    })

    function onSpaceResize(e){
      $(currentSpacer).parent().addClass('show')
      resize(e)
    }
    
    function onSpaceResizeStop(e){
      $(currentSpacer).parent().removeClass('show')
      stopResize()
    }

    function resize(e) {
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

    const $sectionLayout = $('.section_layout')
    const $sectionImg = $('.section_item_img')
    const $sectionHeading = $sectionLayout.find('.heading').closest('section_item')
    const $sectionText = $sectionLayout.find('.text').closest('section_item')
    const $sectionButton = $sectionLayout.find('.button').closest('section_item')

    $sectionHeading.detach().appendTo($sectionLayout)
    $sectionText.detach().appendTo($sectionLayout)
    $sectionButton.detach().appendTo($sectionLayout)
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

function UITouchUp(){
  $('.section_item_img + .spacer.top').height(2)
}