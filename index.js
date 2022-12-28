console.log('work')
const $wr = document.querySelector('[data-wr]')

const $modalWr = document.querySelector('[data-modalWr]')
const $modalContent = document.querySelector('[data-modalContent]')
const $catCreateFormTemplate = document.getElementById('createCatForm')

const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY'

const ACTIONS = {
  DETAIL: 'detail',
  DELETE: 'delete',
}

const getCatHTML = (cat) => `
		<div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem">
		<img src="${cat.image}" class="card-img-top" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">${cat.name}</h5>
			<p class="card-text">
				${cat.description}
			</p>
			<button data-action="${ACTIONS.DETAIL}" type="button" class="btn btn-primary">Detail</button>
			<button data-action="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Delete</button>
		</div>
	</div>
	`

fetch('https://cats.petiteweb.dev/api/single/zlopad/show/')
  .then((res) => res.json())
  .then((data) => {
    $wr.insertAdjacentHTML(
      'afterbegin',
      data.map((cat) => getCatHTML(cat)).join(''),
    )
  })

$wr.addEventListener('click', (e) => {
  if (e.target.dataset.action === ACTIONS.DELETE) {
    const $catWr = e.target.closest('[data-cat-id]')
    const catId = $catWr.dataset.catId

    fetch(`https://cats.petiteweb.dev/api/single/zlopad/delete/${catId}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        return $catWr.remove()
      }

      alert(`Удаление кота с id = ${catId} не удалось`)
    })
  }
})

const formatCreateFormData = (formDataObject) => ({
  ...formDataObject,
  id: +formDataObject.id,
  rate: +formDataObject.rate,
  age: +formDataObject.age,
  favorite: !!formDataObject.favorite,
})

const clickModalWrHandler = (e) => {
  if (e.target === $modalWr) {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
}

const openModalHandler = (e) => {
  const targetModalName = e.target.dataset.openmodal

  if (targetModalName === 'createCat') {
    $modalWr.classList.remove('hidden')
    $modalWr.addEventListener('click', clickModalWrHandler)

    const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true)
    $modalContent.appendChild(cloneCatCreateForm)

    const $createCatForm = document.forms.createCatForm

    const dataFromLS = localStorage.getItem(CREATE_FORM_LS_KEY)

    const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS)

    if (preparedDataFromLS) {
      Object.keys(preparedDataFromLS).forEach((key) => {
        $createCatForm[key].value = preparedDataFromLS[key]
      })
    }

    $createCatForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault()

      const formDataObject = formatCreateFormData(
        Object.fromEntries(new FormData(submitEvent.target).entries()),
      )

      fetch('https://cats.petiteweb.dev/api/single/ZholobovSS/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      }).then((res) => {
        if (res.status === 200) {
          $modalWr.classList.add('hidden')
          $modalWr.removeEventListener('click', clickModalWrHandler)
          $modalContent.innerHTML = ''

      
          localStorage.removeItem(CREATE_FORM_LS_KEY)
          return $wr.insertAdjacentHTML(
            'afterbegin',
            getCatHTML(formDataObject),
          )
        }
        throw Error('Ошибка при создании кота')
      }).catch(alert)
    })
    $createCatForm.addEventListener('change', () => {
      const formattedData = formatCreateFormData(
        Object.fromEntries(new FormData($createCatForm).entries()),
      )

      localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formattedData))
    })
  }
}

document.addEventListener('click', openModalHandler)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $modalWr.classList.add('hidden')
    $modalWr.removeEventListener('click', clickModalWrHandler)
    $modalContent.innerHTML = ''
  }
})