package persistence

type Item[T any] struct {
	object T
}

func NewItem[T any](object T) Item[T] {
	return Item[T]{
		object: object,
	}
}

func (item *Item[T]) Object() T {
	return item.object
}
